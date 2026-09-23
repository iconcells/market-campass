/**
 * @market-campass/shared-domain — Shared domain schema contracts.
 *
 * This is the single import path for all versioned domain schemas used by
 * the API, worker, report generation, and export code.
 *
 * Usage:
 *   import { ResearchRequestSchema, EvidenceItemSchema } from '@market-campass/shared-domain';
 *
 * Schema versions are stable constants — bump them when breaking changes are introduced.
 */

// ── Schema validators ────────────────────────────────────────────────────────
export { ResearchRequestSchema } from './research-request.schema';
export { EvidenceItemSchema, EvidenceSourceSchema, GeographySchema, ObservationPeriodSchema, MetricSchema } from './evidence-item.schema';
export { CalculationVersionSchema, CalculationOutputMetricSchema } from './calculation-version.schema';
export { ReportVersionSchema, MissingDataExplanationSchema } from './report-version.schema';

// ── TypeScript types ─────────────────────────────────────────────────────────
export type { ResearchRequest } from './research-request.schema';
export type {
  EvidenceItem,
  EvidenceSource,
  Geography,
  ObservationPeriod,
  Metric,
  EvidenceType,
} from './evidence-item.schema';
export type {
  CalculationVersion,
  CalculationOutputMetric,
  OutputMetricType,
} from './calculation-version.schema';
export type {
  ReportVersion,
  MissingDataExplanation,
  ReportStatus,
  ConfidenceLabel,
} from './report-version.schema';

// ── Schema version constants ─────────────────────────────────────────────────
export { RESEARCH_REQUEST_SCHEMA_VERSION } from './research-request.schema';
export { EVIDENCE_ITEM_SCHEMA_VERSION, EVIDENCE_TYPES } from './evidence-item.schema';
export { CALCULATION_VERSION_SCHEMA_VERSION, OUTPUT_METRIC_TYPES } from './calculation-version.schema';
export { REPORT_VERSION_SCHEMA_VERSION, REPORT_STATUSES, CONFIDENCE_LABELS } from './report-version.schema';
