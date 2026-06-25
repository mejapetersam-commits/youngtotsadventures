import { Router, type Request, type Response, type NextFunction } from "express";
import { db, registrationsTable } from "@workspace/db";
import { eq, ilike, or, count, sql, and } from "drizzle-orm";
import {
  AdminLoginBody,
  ListRegistrationsQueryParams,
  UpdatePaymentStatusParams,
  UpdatePaymentStatusBody,
  GetRegistrationParams,
  DeleteRegistrationParams,
} from "@workspace/api-zod";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "summer-safari-admin-secret-2026";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "safari2026admin";

// Admin auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed" });
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, username });
});

// GET /admin/registrations
router.get("/admin/registrations", requireAdmin, async (req, res) => {
  const paramsParsed = ListRegistrationsQueryParams.safeParse(req.query);
  const params = paramsParsed.success ? paramsParsed.data : {};

  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 20);
  const offset = (page - 1) * limit;
  const search = params.search as string | undefined;
  const paymentStatus = params.paymentStatus as string | undefined;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(registrationsTable.childName, `%${search}%`),
        ilike(registrationsTable.parentName, `%${search}%`),
        ilike(registrationsTable.parentEmail, `%${search}%`),
        ilike(registrationsTable.parentPhone, `%${search}%`)
      )
    );
  }
  if (paymentStatus && ["pending", "confirmed", "rejected"].includes(paymentStatus)) {
    conditions.push(
      eq(registrationsTable.paymentStatus, paymentStatus as "pending" | "confirmed" | "rejected")
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(registrationsTable)
      .where(whereClause)
      .orderBy(sql`${registrationsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(registrationsTable)
      .where(whereClause),
  ]);

  return res.json({
    registrations: rows.map(serializeRegistration),
    total: Number(totalRows[0]?.count ?? 0),
    page,
    limit,
  });
});

// GET /admin/registrations/export
router.get("/admin/registrations/export", requireAdmin, async (req, res) => {
  const rows = await db
    .select()
    .from(registrationsTable)
    .orderBy(sql`${registrationsTable.createdAt} DESC`);

  const headers = [
    "ID", "Child Name", "Child DOB", "Age", "Parent Name", "Parent Phone", "Parent Email",
    "Home Address", "Allergies", "Medical Conditions", "Physical Limitations", "Special Notes",
    "Emergency Contact", "Relationship", "Emergency Phone", "Authorized Pickup", "Pickup Phone",
    "Consent Accepted", "Consent Signed By", "Consent Timestamp",
    "Payment Status", "Payment Proof URL", "Registered At"
  ];

  const csvRows = rows.map(r => [
    r.id, r.childName, r.childDateOfBirth, r.childAge, r.parentName, r.parentPhone, r.parentEmail,
    r.homeAddress, r.allergies ?? "", r.medicalConditions ?? "", r.physicalLimitations ?? "", r.specialNotes ?? "",
    r.emergencyContactName, r.emergencyContactRelationship, r.emergencyContactPhone,
    r.authorizedPickupPerson, r.authorizedPickupPhone,
    r.consentAccepted ? "Yes" : "No", r.consentSignedBy, r.consentTimestamp?.toISOString() ?? "",
    r.paymentStatus, r.paymentProofUrl ?? "", r.createdAt.toISOString()
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=safari-registrations.csv");
  return res.send(csv);
});

// GET /admin/registrations/:id
router.get("/admin/registrations/:id", requireAdmin, async (req, res) => {
  const paramsParsed = GetRegistrationParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, paramsParsed.data.id))
    .limit(1);

  if (!registration) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(serializeRegistration(registration));
});

// DELETE /admin/registrations/:id
router.delete("/admin/registrations/:id", requireAdmin, async (req, res) => {
  const paramsParsed = DeleteRegistrationParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [deleted] = await db
    .delete(registrationsTable)
    .where(eq(registrationsTable.id, paramsParsed.data.id))
    .returning();

  if (!deleted) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ id: deleted.id });
});

// PATCH /admin/registrations/:id/payment-status
router.patch("/admin/registrations/:id/payment-status", requireAdmin, async (req, res) => {
  const paramsParsed = UpdatePaymentStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const bodyParsed = UpdatePaymentStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Validation failed" });
  }

  const [updated] = await db
    .update(registrationsTable)
    .set({ paymentStatus: bodyParsed.data.paymentStatus as "pending" | "confirmed" | "rejected" })
    .where(eq(registrationsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(serializeRegistration(updated));
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRows, statusRows, todayRows] = await Promise.all([
    db.select({ count: count() }).from(registrationsTable),
    db
      .select({
        status: registrationsTable.paymentStatus,
        count: count(),
      })
      .from(registrationsTable)
      .groupBy(registrationsTable.paymentStatus),
    db
      .select({ count: count() })
      .from(registrationsTable)
      .where(sql`${registrationsTable.createdAt} >= ${today}`),
  ]);

  const statusMap: Record<string, number> = {};
  statusRows.forEach(r => {
    statusMap[r.status] = Number(r.count);
  });

  return res.json({
    total: Number(totalRows[0]?.count ?? 0),
    pending: statusMap["pending"] ?? 0,
    confirmed: statusMap["confirmed"] ?? 0,
    rejected: statusMap["rejected"] ?? 0,
    todayRegistrations: Number(todayRows[0]?.count ?? 0),
  });
});

function serializeRegistration(r: typeof registrationsTable.$inferSelect) {
  return {
    ...r,
    consentTimestamp: r.consentTimestamp?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
