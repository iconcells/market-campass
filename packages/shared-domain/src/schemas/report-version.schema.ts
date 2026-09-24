/**
 * ReportVersionSchema — versioned schema for an immutable research report version.
 *
 * Report versions are immutable once created. Late evidence creates new versions,
 * not silent overwrites. Every version must record its evidence lineage,
 * calculation lineage, confidence label, and any missing-data explanations.
 *
 * Constraint: versionId must not be mutated after creation.
 * Constraint: evidenceIds and calculationVersionIds must be present (may be empty
 * only for explicitly partial reports — partial reports must list missingDataExplanations).
 */

import { z } from 'zod';

export const REPORT_VERSION_SCHEMA_VERSION = '1.0.0' as const;

export const REPORT_STATUSES = [
  'pending',
  'processing',
  'partial',
  'completed',
  'failed',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const CONFIDENCE_LABELS = [
  'high',
  'medium',
  'low',
  'insufficient_data',
] as const;

export type ConfidenceLabel = (typeof CONFIDENCE_LABELS)[number];

export const MissingDataExplanationSchema = z.object({
  /** Which research area or section is missing data. */
  area: z.string().min(1, 'missingDataExplanation.area must not be empty'),
  /** Human-readable reason why data is missing (connector failure, no approved source, etc.). */
  reason: z.string().min(1, 'missingDataExplanation.reason must not be empty'),
  /** Whether this gap materially impacts report conclusions. */
  impactsConclusions: z.boolean(),
});

export const ReportVersionSchema = z
  .object({
    /** Stable schema version for forward-compatibility checks. */
    reportSchemaVersion: z.literal(REPORT_VERSION_SCHEMA_VERSION),

    /**
     * Immutable unique identifier for this specific report version (UUID).
     * A new version must never reuse or overwrite a prior versionId.
     */
    versionId: z.string().uuid('versionId must be a UUID'),

    /** Account that owns this report. */
    accountId: z.string().uuid('accountId must be a UUID'),

    /** The research job that produced this report version. */
    researchJobId: z.string().uuid('researchJobId must be a UUID'),

    /** Current lifecycle status of this report version. */
    status: z.enum(REPORT_STATUSES, {
      errorMap: () => ({
        message: `status must be one of: ${REPORT_STATUSES.join(', ')}`,
      }),
    }),

    /** ISO 8601 datetime when this version was created. Immutable after creation. */
    createdAt: z
      .string()
      .datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),

    /**
     * Evidence item IDs that back the claims in this report version.
     * Must be present (empty array is valid only for 'pending' or 'failed' status).
     */
    evidenceIds: z.array(z.string().uuid('each evidenceId must be a UUID')),

    /**
     * Calculation version IDs for all deterministic calculations referenced.
     * Must be present (empty array valid only for non-completed statuses).
     */
    calculationVersionIds: z.array(
      z.string().uuid('each calculationVersionId must be a UUID'),
    ),

    /**
     * Overall confidence label for the report.
     * 'insufficient_data' must be used when evidenceIds is empty on a partial report.
     */
    confidenceLabel: z.enum(CONFIDENCE_LABELS, {
      errorMap: () => ({
        message: `confidenceLabel must be one of: ${CONFIDENCE_LABELS.join(', ')}`,
      }),
    }),

    /**
     * Explanations for each research area where data is missing.
     * Required when status is 'partial'. Must be empty when status is 'completed'.
     */
    missingDataExplanations: z.array(MissingDataExplanationSchema),

    /** Optional: human-readable report title. */
    title: z.string().optional(),

    /** Optional: identifier for the confirmed product scope this report covers. */
    confirmedProductScopeId: z.string().uuid().optional(),

    /** Optional: ISO 3166-1 alpha-2 country code covered by this report. */
    country: z
      .string()
      .regex(/^[A-Z]{2}$/, 'country must be an ISO 3166-1 alpha-2 code')
      .optional(),

    /** Optional: ISO 4217 currency code used in this report. */
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/, 'currency must be an ISO 4217 code')
      .optional(),
  })
  .refine(
    (data) => {
      // Completed reports must have at least one evidence ID
      if (data.status === 'completed' && data.evidenceIds.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'A completed report must reference at least one evidence ID',
      path: ['evidenceIds'],
    },
  )
  .refine(
    (data) => {
      // Partial reports must explain what is missing
      if (data.status === 'partial' && data.missingDataExplanations.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: 'A partial report must include at least one missingDataExplanation',
      path: ['missingDataExplanations'],
    },
  )
  .refine(
    (data) => {
      // Completed reports must not have missing data explanations
      if (data.status === 'completed' && data.missingDataExplanations.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'A completed report must not have missingDataExplanations',
      path: ['missingDataExplanations'],
    },
  );

export type MissingDataExplanation = z.infer<typeof MissingDataExplanationSchema>;
export type ReportVersion = z.infer<typeof ReportVersionSchema>;
