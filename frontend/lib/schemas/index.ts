/**
 * Zod Schemas for Sinmail API
 * Single source of truth for all DTOs and input validation.
 */
import { z } from "zod"

// ============================================================================
// Recipient Schemas
// ============================================================================

export const createRecipientSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  email: z.string().email("Invalid email address"),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  defaultPriceUsd: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid USD amount")
    .default("0.10")
})

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>

export const updateRecipientSchema = createRecipientSchema
  .partial()
  .omit({ email: true })

export type UpdateRecipientInput = z.infer<typeof updateRecipientSchema>

export const recipientResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  email: z.string(),
  walletAddress: z.string(),
  defaultPriceUsd: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type RecipientResponse = z.infer<typeof recipientResponseSchema>

// Public recipient info (no sensitive data)
export const publicRecipientSchema = z.object({
  slug: z.string(),
  defaultPriceUsd: z.string()
})

export type PublicRecipient = z.infer<typeof publicRecipientSchema>

// ============================================================================
// Allowlist Schemas
// ============================================================================

export const allowlistTypeSchema = z.enum(["EMAIL", "DOMAIN"])

export type AllowlistType = z.infer<typeof allowlistTypeSchema>

export const createAllowlistEntrySchema = z
  .object({
    type: allowlistTypeSchema,
    value: z.string().min(1, "Value is required")
  })
  .refine(
    data => {
      if (data.type === "EMAIL") {
        return z.string().email().safeParse(data.value).success
      }
      // Domain validation - simple check for now
      return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(data.value)
    },
    {
      message: "Invalid email or domain format",
      path: ["value"]
    }
  )

export type CreateAllowlistEntryInput = z.infer<
  typeof createAllowlistEntrySchema
>

export const allowlistEntryResponseSchema = z.object({
  id: z.string(),
  type: allowlistTypeSchema,
  value: z.string(),
  createdAt: z.date()
})

export type AllowlistEntryResponse = z.infer<
  typeof allowlistEntryResponseSchema
>

// ============================================================================
// Message Schemas
// ============================================================================

export const messageStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "DELIVERED",
  "FAILED",
  "FREE"
])

export type MessageStatus = z.infer<typeof messageStatusSchema>

export const createMessageSchema = z.object({
  recipientSlug: z.string().min(1, "Recipient slug is required"),
  senderEmail: z.string().email("Invalid sender email").optional(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be at most 200 characters"),
  body: z
    .string()
    .min(1, "Body is required")
    .max(10000, "Body must be at most 10,000 characters"),
  idempotencyKey: z.string().optional()
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>

export const messageResponseSchema = z.object({
  id: z.string(),
  recipientSlug: z.string(),
  senderEmail: z.string().nullable(),
  subject: z.string(),
  status: messageStatusSchema,
  receiptUrl: z.string().nullable(),
  createdAt: z.date(),
  deliveredAt: z.date().nullable()
})

export type MessageResponse = z.infer<typeof messageResponseSchema>

// ============================================================================
// Preflight Schemas
// ============================================================================

export const preflightRequestSchema = z.object({
  recipientSlug: z.string().min(1, "Recipient slug is required"),
  senderEmail: z.string().email("Invalid email").optional()
})

export type PreflightRequest = z.infer<typeof preflightRequestSchema>

export const preflightResponseSchema = z.object({
  recipientSlug: z.string(),
  isAllowlisted: z.boolean(),
  priceUsd: z.string().nullable(), // null if allowlisted
  walletAddress: z.string(),
  network: z.string()
})

export type PreflightResponse = z.infer<typeof preflightResponseSchema>

// ============================================================================
// Payment Schemas
// ============================================================================

export const paymentStatusSchema = z.enum(["PENDING", "SETTLED", "FAILED"])

export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const paymentResponseSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  amountUsd: z.string(),
  network: z.string(),
  payerAddress: z.string(),
  status: paymentStatusSchema,
  transactionHash: z.string().nullable(),
  settledAt: z.date().nullable()
})

export type PaymentResponse = z.infer<typeof paymentResponseSchema>

// ============================================================================
// x402 Schemas
// ============================================================================

export const x402PaymentRequirementsSchema = z.object({
  scheme: z.literal("exact"),
  network: z.string(),
  maxAmountRequired: z.string(),
  resource: z.string(),
  description: z.string(),
  mimeType: z.string(),
  payTo: z.string(),
  maxTimeoutSeconds: z.number(),
  asset: z.string(),
  outputSchema: z.record(z.any()).nullable().optional(),
  extra: z.record(z.any()).nullable().optional()
})

export type X402PaymentRequirements = z.infer<
  typeof x402PaymentRequirementsSchema
>

export const x402PaymentRequiredResponseSchema = z.object({
  x402Version: z.number(),
  error: z.string(),
  accepts: z.array(x402PaymentRequirementsSchema)
})

export type X402PaymentRequiredResponse = z.infer<
  typeof x402PaymentRequiredResponseSchema
>
