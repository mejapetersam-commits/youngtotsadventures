import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "confirmed", "rejected"]);

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  // Parent / Guardian
  parentName: text("parent_name").notNull(),
  parentPhone: text("parent_phone").notNull(),
  parentEmail: text("parent_email").notNull(),
  // Child
  childName: text("child_name").notNull(),
  // Nullable: not always captured for registrations imported from an external
  // source (e.g. a manual/offline registration batch) rather than submitted
  // through the 5-step public registration form.
  childDateOfBirth: text("child_date_of_birth"),
  childAge: integer("child_age").notNull(),
  homeAddress: text("home_address"),
  // Medical
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  physicalLimitations: text("physical_limitations"),
  specialNotes: text("special_notes"),
  // Emergency contact 1 (nullable — see childDateOfBirth note above)
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactPhone: text("emergency_contact_phone"),
  // Emergency contact 2 (optional)
  emergency2ContactName: text("emergency2_contact_name"),
  emergency2ContactRelationship: text("emergency2_contact_relationship"),
  emergency2ContactPhone: text("emergency2_contact_phone"),
  // Pickup authorization (nullable — see childDateOfBirth note above)
  authorizedPickupPerson: text("authorized_pickup_person"),
  authorizedPickupPhone: text("authorized_pickup_phone"),
  // Consent (nullable — see childDateOfBirth note above; consentAccepted
  // defaults to false so imported records are never silently treated as
  // having given consent)
  consentAccepted: boolean("consent_accepted").notNull().default(false),
  consentSignature: text("consent_signature"),
  consentSignedBy: text("consent_signed_by"),
  consentTimestamp: timestamp("consent_timestamp"),
  // Payment
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentProofUrl: text("payment_proof_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
  paymentStatus: true,
  paymentProofUrl: true,
  consentTimestamp: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
