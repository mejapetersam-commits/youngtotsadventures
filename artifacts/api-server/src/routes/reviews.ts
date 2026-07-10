import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, and, gt, desc, count } from "drizzle-orm";
import { CreateReviewBody } from "@workspace/api-zod";

const router = Router();

const MAX_PUBLIC_REVIEWS = 50;

// Simple in-memory rate limiter: max submissions per IP per window.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const submissionLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    submissionLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  submissionLog.set(ip, timestamps);
  // Opportunistic cleanup to keep the map bounded.
  if (submissionLog.size > 5000) {
    for (const [key, ts] of submissionLog) {
      if (ts.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) submissionLog.delete(key);
    }
  }
  return false;
}

function serializePublicReview(r: typeof reviewsTable.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    rating: r.rating,
    review: r.review,
    createdAt: r.createdAt.toISOString(),
  };
}

// GET /reviews — approved reviews only (public)
router.get("/reviews", async (req, res) => {
  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(MAX_PUBLIC_REVIEWS),
    db
      .select({ value: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved")),
  ]);

  return res.json({
    reviews: rows.map(serializePublicReview),
    total: Number(totalRow[0]?.value ?? 0),
  });
});

// POST /reviews — public submission, held as "pending" until an admin approves
router.post("/reviews", async (req, res) => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success || !Number.isInteger(parsed.data.rating)) {
    return res.status(400).json({ error: "Please check your name, email, rating and review and try again." });
  }

  const data = parsed.data;

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (data.website && data.website.trim() !== "") {
    req.log.warn({ ip: req.ip }, "Review honeypot triggered — dropping submission");
    return res.status(201).json({
      id: 0,
      name: data.name,
      rating: data.rating,
      review: data.review,
      createdAt: new Date().toISOString(),
    });
  }

  const ip = req.ip ?? "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many review submissions. Please try again later." });
  }

  // Duplicate guard: same email within 24 hours
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [duplicate] = await db
    .select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.email, data.email.trim().toLowerCase()),
        gt(reviewsTable.createdAt, dayAgo),
      ),
    )
    .limit(1);

  if (duplicate) {
    return res.status(429).json({ error: "You have already submitted a review recently. Thank you!" });
  }

  const [created] = await db
    .insert(reviewsTable)
    .values({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      rating: data.rating,
      review: data.review.trim(),
      status: "pending",
    })
    .returning();

  req.log.info({ reviewId: created.id }, "New review submitted (pending approval)");
  return res.status(201).json(serializePublicReview(created));
});

export default router;
