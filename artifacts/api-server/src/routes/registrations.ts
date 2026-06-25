import { Router } from "express";
import { db, registrationsTable } from "@workspace/db";
import { eq, count, and, gt } from "drizzle-orm";
import {
  CreateRegistrationBody,
  UploadPaymentProofBody,
  UploadPaymentProofParams,
} from "@workspace/api-zod";
import { notifyNewRegistration } from "../lib/whatsapp";

const router = Router();

const SAFARI_CAPACITY = 30;

// GET /registrations/count - public spot counter (only confirmed reduce spots)
router.get("/registrations/count", async (req, res) => {
  const [totalRow] = await db.select({ value: count() }).from(registrationsTable);
  const [confirmedRow] = await db
    .select({ value: count() })
    .from(registrationsTable)
    .where(eq(registrationsTable.paymentStatus, "confirmed"));
  const total = Number(totalRow?.value ?? 0);
  const confirmed = Number(confirmedRow?.value ?? 0);
  return res.json({
    total,
    confirmed,
    capacity: SAFARI_CAPACITY,
    spotsLeft: Math.max(0, SAFARI_CAPACITY - confirmed),
  });
});

// POST /registrations - public registration submission
router.post("/registrations", async (req, res) => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

  // Duplicate detection: same child name + parent phone within 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const [duplicate] = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.childName, data.childName),
        eq(registrationsTable.parentPhone, data.parentPhone),
        gt(registrationsTable.createdAt, tenMinutesAgo)
      )
    )
    .limit(1);

  if (duplicate) {
    return res.status(409).json({
      error: "You have already submitted a registration for this child. If you need help please WhatsApp 0720 764 275."
    });
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values({
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      childName: data.childName,
      childDateOfBirth: data.childDateOfBirth,
      childAge: data.childAge,
      homeAddress: data.homeAddress,
      allergies: data.allergies ?? null,
      medicalConditions: data.medicalConditions ?? null,
      physicalLimitations: data.physicalLimitations ?? null,
      specialNotes: data.specialNotes ?? null,
      emergencyContactName: data.emergencyContactName,
      emergencyContactRelationship: data.emergencyContactRelationship,
      emergencyContactPhone: data.emergencyContactPhone,
      emergency2ContactName: data.emergency2ContactName ?? null,
      emergency2ContactRelationship: data.emergency2ContactRelationship ?? null,
      emergency2ContactPhone: data.emergency2ContactPhone ?? null,
      authorizedPickupPerson: data.authorizedPickupPerson,
      authorizedPickupPhone: data.authorizedPickupPhone,
      consentAccepted: data.consentAccepted,
      consentSignature: data.consentSignature,
      consentSignedBy: data.consentSignedBy,
      consentTimestamp: new Date(),
    })
    .returning();

  // Fire-and-forget WhatsApp alert — does not block the response
  notifyNewRegistration({
    registrationId: registration.id,
    childName: registration.childName,
    parentName: registration.parentName,
    parentPhone: registration.parentPhone,
  }).catch(() => {/* already logged inside */});

  return res.status(201).json(serializeRegistration(registration));
});

// POST /registrations/:id/payment-proof - upload payment proof
router.post("/registrations/:id/payment-proof", async (req, res) => {
  const paramsParsed = UploadPaymentProofParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const bodyParsed = UploadPaymentProofBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Validation failed" });
  }

  const { id } = paramsParsed.data;
  const { paymentProofBase64, mimeType } = bodyParsed.data;

  const existing = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, id))
    .limit(1);

  if (!existing.length) {
    return res.status(404).json({ error: "Registration not found" });
  }

  // Store the image as an inline data URL — no filesystem dependencies, works in all environments
  const paymentProofUrl = `data:${mimeType};base64,${paymentProofBase64}`;

  const [updated] = await db
    .update(registrationsTable)
    .set({ paymentProofUrl })
    .where(eq(registrationsTable.id, id))
    .returning();

  return res.json(serializeRegistration(updated));
});

function serializeRegistration(r: typeof registrationsTable.$inferSelect) {
  return {
    ...r,
    childDateOfBirth: r.childDateOfBirth,
    consentTimestamp: r.consentTimestamp?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
