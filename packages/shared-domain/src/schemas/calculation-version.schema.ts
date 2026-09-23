/**
 * CalculationVersionSchema — versioned schema for a deterministic calculation result.
 *
 * Quantitative outputs (pricing, seasonality, demand, store ranking) must record
 * their formula name, version, all input evidence IDs, and the deterministic method
 * so results are reproducible and traceable.
 *
 * Constraint: A calculation with a quantitative output must reference at least one
 * input evidence ID. AI free text must NOT be used as numeric output.
 */

import { z } from 'zod';

export const CALCULATION_VERSION_SCHEMA_VERSION = '1.0.0' as const;

export const OUTPUT_METRIC_TYPES = [
  'unit_price',
  'landed_price',
  'price_distribution',
  'store_rank',
  'seasonality_index',
  'demand_index',
  'demographic_confidence',
  'currency_conversion',
  'review_aggregate',
] as const;

export type OutputMetricType = (typeof OUTPUT_METRIC_TYPES)[number];

export const CalculationOutputMetricSchema = z.object({
  /** Metric type classification. */
  type: z.enum(OUTPUT_METRIC_TYPES, {
    errorMap: () => ({
      message: `outputMetric.type must be one of: ${OUTPUT_METRIC_TYPES.join(', ')}`,
    }),
  }),
  /** Calculated numeric value — must be finite. */
  value: z.number().finite('outputMetric.value must be a finite number'),
  /** Unit of the output (e.g. "USD", "index", "rank", "percent"). */
  unit: z.string().min(1, 'outputMetric.unit must not be empty'),
  /** Optional confidence score in range [0, 1]. */
  confidence: z.number().min(0).max(1).optional(),
  /** Human-readable label describing any limitations or caveats. */
  limitations: z.string().optional(),
});

export const CalculationVersionSchema = z
  .object({
    /** Stable schema version for forward-compatibility checks. */
    calculationSchemaVersion: z.literal(CALCULATION_VERSION_SCHEMA_VERSION),

    /** Unique identifier for this calculation version (UUID). */
    calculationId: z.string().uuid('calculationId must be a UUID'),

    /** The research job this calculation is part of. */
    researchJobId: z.string().uuid('researchJobId must be a UUID'),

    /** Account that owns the research job. */
    accountId: z.string().uuid('accountId must be a UUID'),

    /**
     * Name of the formula applied (e.g. "landed_price_v1", "demand_index_composite_v2").
     * Must be a stable, versioned identifier — not AI-generated free text.
     */
    formulaName: z.string().min(1, 'formulaName must not be empty'),

    /**
     * Semantic version of the formula.
     * Changing the formula logic requires a new formulaVersion.
     */
    formulaVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, 'formulaVersion must follow semver (e.g. "1.0.0")'),

    /**
     * All evidence IDs that were used as inputs to this calculation.
     * Must contain at least one ID for any quantitative output.
     */
    inputEvidenceIds: z
      .array(z.string().uuid('each inputEvidenceId must be a UUID'))
      .min(1, 'inputEvidenceIds must contain at least one evidence ID'),

    /** The deterministic calculation result. */
    outputMetric: CalculationOutputMetricSchema,

    /**
     * Short description of the deterministic method applied
     * (e.g. "weighted median of landed prices across comparable offers").
     */
    deterministicMethod: z
      .string()
      .min(1, 'deterministicMethod must not be empty'),

    /** ISO 8601 datetime when this calculation version was created. */
    createdAt: z
      .string()
      .datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),

    /** Optional reference to the report version that includes this calculation. */
    reportVersionId: z.string().uuid().optional(),
  })
  .refine((data) => data.inputEvidenceIds.length > 0, {
    message: 'A quantitative calculation must reference at least one input evidence ID',
    path: ['inputEvidenceIds'],
  });

export type CalculationOutputMetric = z.infer<typeof CalculationOutputMetricSchema>;
export type CalculationVersion = z.infer<typeof CalculationVersionSchema>;
