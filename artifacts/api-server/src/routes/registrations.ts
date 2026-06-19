import { Router } from "express";
import { db, registrationsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  CreateRegistrationBody,
  UploadPaymentProofBody,
  UploadPaymentProofParams,
} from "@workspace/api-zod";
import path from "path";
import fs from "fs";
import { notifyNewRegistration } from "../lib/whatsapp";

const router = Router();

const SAFARI_CAPACITY = 30;

// GET /registrations/count - public spot counter
router.get("/registrations/count", async (req, res) => {
  const [row] = await db.select({ value: count() }).from(registrationsTable);
  const total = Number(row?.value ?? 0);
  return res.json({
    total,
    capacity: SAFARI_CAPACITY,
    spotsLeft: Math.max(0, SAFARI_CAPACITY - total),
  });
});

// POST /registrations - public registration submission
router.post("/registrations", async (req, res) => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

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

  // Save the base64 image to disk
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : "jpg";
  const filename = `payment-proof-${id}-${Date.now()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(paymentProofBase64, "base64");
  fs.writeFileSync(filepath, buffer);

  const paymentProofUrl = `/api/uploads/${filename}`;

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
