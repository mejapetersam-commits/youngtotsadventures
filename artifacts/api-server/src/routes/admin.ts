import { Router, type Request, type Response, type NextFunction } from "express";
import { db, registrationsTable, reviewsTable } from "@workspace/db";
import { eq, ilike, or, count, sql, and, asc, desc, type SQL } from "drizzle-orm";
import {
  AdminLoginBody,
  ListRegistrationsQueryParams,
  ExportRegistrationsQueryParams,
  UpdatePaymentStatusParams,
  UpdatePaymentStatusBody,
  GetRegistrationParams,
  DeleteRegistrationParams,
  ListReviewsQueryParams,
  UpdateReviewParams,
  UpdateReviewBody,
  DeleteReviewParams,
} from "@workspace/api-zod";
import jwt from "jsonwebtoken";
import { sendPaymentConfirmationEmail } from "../lib/email";

const PROGRAM_NAME = "Summer Safari 2026";

const SORT_COLUMNS = {
  id: registrationsTable.id,
  parentName: registrationsTable.parentName,
  parentEmail: registrationsTable.parentEmail,
  parentPhone: registrationsTable.parentPhone,
  childName: registrationsTable.childName,
  childAge: registrationsTable.childAge,
  paymentStatus: registrationsTable.paymentStatus,
  createdAt: registrationsTable.createdAt,
} as const;

function buildSearchFilter(search: string | undefined): SQL | undefined {
  if (!search) return undefined;
  return or(
    ilike(registrationsTable.childName, `%${search}%`),
    ilike(registrationsTable.parentName, `%${search}%`),
    ilike(registrationsTable.parentEmail, `%${search}%`),
    ilike(registrationsTable.parentPhone, `%${search}%`),
  );
}

function buildStatusFilter(paymentStatus: string | undefined): SQL | undefined {
  if (paymentStatus && ["pending", "confirmed", "rejected"].includes(paymentStatus)) {
    return eq(
      registrationsTable.paymentStatus,
      paymentStatus as "pending" | "confirmed" | "rejected",
    );
  }
  return undefined;
}

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

  // eslint-disable-next-line no-console
  console.log(
    "[admin/login] received username:",
    JSON.stringify(username),
    "| expected username:",
    JSON.stringify(ADMIN_USERNAME),
    "| password length received:",
    password.length,
    "| expected password length:",
    ADMIN_PASSWORD.length,
  );

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
  const sortBy = (params.sortBy as keyof typeof SORT_COLUMNS | undefined) ?? "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc" | undefined) ?? "desc";

  const conditions = [buildSearchFilter(search), buildStatusFilter(paymentStatus)].filter(
    (c): c is SQL => c !== undefined,
  );
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumn = SORT_COLUMNS[sortBy] ?? registrationsTable.createdAt;
  const orderByClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(registrationsTable)
      .where(whereClause)
      .orderBy(orderByClause)
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
  const paramsParsed = ExportRegistrationsQueryParams.safeParse(req.query);
  const params = paramsParsed.success ? paramsParsed.data : {};
  const search = params.search as string | undefined;
  const paymentStatus = params.paymentStatus as string | undefined;

  const conditions = [buildSearchFilter(search), buildStatusFilter(paymentStatus)].filter(
    (c): c is SQL => c !== undefined,
  );
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(registrationsTable)
    .where(whereClause)
    .orderBy(sql`${registrationsTable.createdAt} DESC`);

  const headers = [
    "ID", "Parent Name", "Email", "Phone Number", "Child Name", "Child Age",
    "Program/Event", "Registration Date", "Payment Status",
  ];

  const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const csvRows = rows.map((r) =>
    [
      r.id,
      r.parentName,
      r.parentEmail,
      r.parentPhone,
      r.childName,
      r.childAge,
      PROGRAM_NAME,
      formatDate(r.createdAt),
      formatStatus(r.paymentStatus),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

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

  const id = paramsParsed.data.id;
  const newStatus = bodyParsed.data.paymentStatus as "pending" | "confirmed" | "rejected";

  let updated: typeof registrationsTable.$inferSelect | undefined;
  let didTransitionToConfirmed = false;

  if (newStatus === "confirmed") {
    // Atomically flip pending -> confirmed. This both detects the transition and guards
    // against concurrent confirms (double-click / multiple admins) sending duplicate emails.
    const [transitioned] = await db
      .update(registrationsTable)
      .set({ paymentStatus: "confirmed" })
      .where(
        and(
          eq(registrationsTable.id, id),
          eq(registrationsTable.paymentStatus, "pending"),
        ),
      )
      .returning();

    if (transitioned) {
      updated = transitioned;
      didTransitionToConfirmed = true;
    } else {
      // Row was not pending (already confirmed, or rejected -> confirmed): set status
      // without sending an email, per the "only pending -> confirmed" requirement.
      const [u] = await db
        .update(registrationsTable)
        .set({ paymentStatus: "confirmed" })
        .where(eq(registrationsTable.id, id))
        .returning();
      updated = u;
    }
  } else {
    const [u] = await db
      .update(registrationsTable)
      .set({ paymentStatus: newStatus })
      .where(eq(registrationsTable.id, id))
      .returning();
    updated = u;
  }

  if (!updated) {
    return res.status(404).json({ error: "Not found" });
  }

  // Send the confirmation email ONLY on a genuine pending -> confirmed transition.
  let emailSent = false;
  let emailError: string | null = null;
  if (didTransitionToConfirmed) {
    const result = await sendPaymentConfirmationEmail({
      parentName: updated.parentName,
      parentEmail: updated.parentEmail,
      childName: updated.childName,
      registrationId: updated.id,
      registeredAt: updated.createdAt,
    });
    emailSent = result.sent;
    emailError = result.error;
  }

  return res.json({ ...serializeRegistration(updated), emailSent, emailError });
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

// GET /admin/reviews
router.get("/admin/reviews", requireAdmin, async (req, res) => {
  const paramsParsed = ListReviewsQueryParams.safeParse(req.query);
  const params = paramsParsed.success ? paramsParsed.data : {};

  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 20);
  const offset = (page - 1) * limit;
  const status = params.status as string | undefined;

  const whereClause =
    status && ["pending", "approved", "rejected"].includes(status)
      ? eq(reviewsTable.status, status as "pending" | "approved" | "rejected")
      : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(reviewsTable)
      .where(whereClause)
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(reviewsTable).where(whereClause),
  ]);

  return res.json({
    reviews: rows.map(serializeReview),
    total: Number(totalRows[0]?.count ?? 0),
    page,
    limit,
  });
});

// PATCH /admin/reviews/:id
router.patch("/admin/reviews/:id", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const bodyParsed = UpdateReviewBody.safeParse(req.body);
  if (
    !bodyParsed.success ||
    (bodyParsed.data.rating !== undefined && !Number.isInteger(bodyParsed.data.rating))
  ) {
    return res.status(400).json({ error: "Validation failed" });
  }

  const changes: Partial<typeof reviewsTable.$inferInsert> = {};
  if (bodyParsed.data.name !== undefined) changes.name = bodyParsed.data.name.trim();
  if (bodyParsed.data.rating !== undefined) changes.rating = bodyParsed.data.rating;
  if (bodyParsed.data.review !== undefined) changes.review = bodyParsed.data.review.trim();
  if (bodyParsed.data.status !== undefined) {
    changes.status = bodyParsed.data.status as "pending" | "approved" | "rejected";
  }

  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: "No changes provided" });
  }

  const [updated] = await db
    .update(reviewsTable)
    .set(changes)
    .where(eq(reviewsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(serializeReview(updated));
});

// DELETE /admin/reviews/:id
router.delete("/admin/reviews/:id", requireAdmin, async (req, res) => {
  const paramsParsed = DeleteReviewParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [deleted] = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, paramsParsed.data.id))
    .returning({ id: reviewsTable.id });

  if (!deleted) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ id: deleted.id });
});

function serializeReview(r: typeof reviewsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

function serializeRegistration(r: typeof registrationsTable.$inferSelect) {
  return {
    ...r,
    consentTimestamp: r.consentTimestamp?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
