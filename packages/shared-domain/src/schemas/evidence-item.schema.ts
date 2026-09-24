/**
 * EvidenceItemSchema — versioned schema for a single piece of collected market evidence.
 *
 * Every evidence item must record its source provenance, collection timestamp,
 * geography, observation period, and metric so reports can show source dates,
 * stale-data warnings, and evidence citations.
 */

import { z } from 'zod';

export const EVIDENCE_ITEM_SCHEMA_VERSION = '1.0.0' as const;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_COUNTRY_REGEX = /^[A-Z]{2}$/;

/** Allowed evidence type classifications. */
export const EVIDENCE_TYPES = [
  'price_observation',
  'sales_rank',
  'review_aggregate',
  'demographic_aggregate',
  'inventory_signal',
  'search_volume',
  'seasonal_index',
  'offer_listing',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/**
 * Source provenance — must supply at least one of `provider` (licensed/API source)
 * or `url` (permitted public page). Both may be present.
 */
export const EvidenceSourceSchema = z
  .object({
    /** Licensed data provider or API name (e.g. "Amazon SP-API", "SimilarWeb"). */
    provider: z.string().min(1).optional(),
    /** URL of the fetched public page. Must be HTTPS. */
    url: z.string().url().startsWith('https://', 'source.url must use HTTPS').optional(),
    /** ISO 8601 datetime when the credential/API access token was used. */
    fetchedWithCredentialRef: z.string().optional(),
  })
  .refine((src) => src.provider !== undefined || src.url !== undefined, {
    message: 'source must include at least one of provider or url',
  });

export const GeographySchema = z.object({
  /** ISO 3166-1 alpha-2 country code. */
  country: z
    .string()
    .regex(ISO_COUNTRY_REGEX, 'geography.country must be an ISO 3166-1 alpha-2 code'),
  /** Optional region/state within the country. */
  region: z.string().optional(),
});

export const ObservationPeriodSchema = z
  .object({
    startDate: z
      .string()
      .regex(ISO_DATE_REGEX, 'observationPeriod.startDate must be an ISO date string (YYYY-MM-DD)'),
    endDate: z
      .string()
      .regex(ISO_DATE_REGEX, 'observationPeriod.endDate must be an ISO date string (YYYY-MM-DD)'),
  })
  .refine((p) => new Date(p.startDate) <= new Date(p.endDate), {
    message: 'observationPeriod.startDate must not be after endDate',
    path: ['startDate'],
  });

export const MetricSchema = z.object({
  /** Metric name e.g. "unit_price", "monthly_sales_rank", "review_count". */
  name: z.string().min(1, 'metric.name must not be empty'),
  /** Numeric value — must be finite (rejects NaN and Infinity). */
  value: z
    .number()
    .finite('metric.value must be a finite number'),
  /** Unit of measurement e.g. "USD", "rank", "count", "index". */
  unit: z.string().min(1, 'metric.unit must not be empty'),
  /** Optional sample size that produced this aggregate metric. */
  sampleSize: z.number().int().positive().optional(),
});

export const EvidenceItemSchema = z.object({
  /** Stable schema version for forward-compatibility checks. */
  evidenceSchemaVersion: z.literal(EVIDENCE_ITEM_SCHEMA_VERSION),

  /** Unique evidence item identifier (UUID). */
  evidenceId: z.string().uuid('evidenceId must be a UUID'),

  /** The research job this evidence belongs to. */
  researchJobId: z.string().uuid('researchJobId must be a UUID'),

  /** Account that owns the research job. */
  accountId: z.string().uuid('accountId must be a UUID'),

  /** Source provenance — at least one of provider or url must be present. */
  source: EvidenceSourceSchema,

  /** ISO 8601 datetime when the evidence was collected. */
  collectedAt: z
    .string()
    .datetime({ message: 'collectedAt must be an ISO 8601 datetime string' }),

  /** Geographic scope of this observation. */
  geography: GeographySchema,

  /** Time window this evidence observation covers. */
  observationPeriod: ObservationPeriodSchema,

  /** The measured metric for this evidence item. */
  metric: MetricSchema,

  /** Classification of what this evidence measures. */
  evidenceType: z.enum(EVIDENCE_TYPES, {
    errorMap: () => ({ message: `evidenceType must be one of: ${EVIDENCE_TYPES.join(', ')}` }),
  }),

  /** Optional: name/URL of the specific product page observed. */
  productPageUrl: z.string().url().startsWith('https://').optional(),

  /** Optional: seller or merchant identifier observed. */
  sellerId: z.string().optional(),

  /** Optional: raw content hash for deduplication (SHA-256 hex). */
  contentHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
});

export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;
export type Geography = z.infer<typeof GeographySchema>;
export type ObservationPeriod = z.infer<typeof ObservationPeriodSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
