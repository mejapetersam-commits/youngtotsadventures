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
  childDateOfBirth: text("child_date_of_birth").notNull(),
  childAge: integer("child_age").notNull(),
  homeAddress: text("home_address").notNull(),
  // Medical
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  physicalLimitations: text("physical_limitations"),
  specialNotes: text("special_notes"),
  // Emergency contact
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactRelationship: text("emergency_contact_relationship").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  // Pickup authorization
  authorizedPickupPerson: text("authorized_pickup_person").notNull(),
  authorizedPickupPhone: text("authorized_pickup_phone").notNull(),
  // Consent
  consentAccepted: boolean("consent_accepted").notNull().default(false),
  consentSignature: text("consent_signature").notNull(),
  consentSignedBy: text("consent_signed_by").notNull(),
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
