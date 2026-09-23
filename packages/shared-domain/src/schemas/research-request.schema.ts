/**
 * ResearchRequestSchema — versioned schema for a product market research request.
 *
 * Constraints (from WO-001):
 *  - Exactly one country (ISO 3166-1 alpha-2)
 *  - Exactly one currency (ISO 4217)
 *  - Positive target selling price when supplied
 *  - Research period boundaries must be valid ISO dates
 *  - MVP: single-market only; multi-market comparison is out of scope
 */

import { z } from 'zod';

/** Schema version constant — bump when breaking changes are introduced. */
export const RESEARCH_REQUEST_SCHEMA_VERSION = '1.0.0' as const;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_COUNTRY_REGEX = /^[A-Z]{2}$/;
const ISO_CURRENCY_REGEX = /^[A-Z]{3}$/;

export const ResearchRequestSchema = z
  .object({
    /** Stable schema version for forward-compatibility checks. */
    requestSchemaVersion: z.literal(RESEARCH_REQUEST_SCHEMA_VERSION),

    /** Human-readable product query text (name, URL, barcode, model number, etc.). */
    query: z.string().min(1, 'query must not be empty'),

    /**
     * Exactly one ISO 3166-1 alpha-2 country code.
     * Multi-market comparison is outside the MVP scope.
     */
    country: z
      .string()
      .regex(ISO_COUNTRY_REGEX, 'country must be an ISO 3166-1 alpha-2 code (e.g. "US")'),

    /**
     * Exactly one ISO 4217 currency code.
     * Multi-currency reports are outside the MVP scope.
     */
    currency: z
      .string()
      .regex(ISO_CURRENCY_REGEX, 'currency must be an ISO 4217 code (e.g. "USD")'),

    /**
     * Market observation window — ISO date strings (YYYY-MM-DD).
     * periodStart must be before periodEnd.
     */
    periodStart: z
      .string()
      .regex(ISO_DATE_REGEX, 'periodStart must be an ISO date string (YYYY-MM-DD)'),

    periodEnd: z
      .string()
      .regex(ISO_DATE_REGEX, 'periodEnd must be an ISO date string (YYYY-MM-DD)'),

    /**
     * Optional target selling price in the specified currency.
     * When present, must be a positive finite number.
     * The system must NOT make profitability claims from this field alone.
     */
    targetPrice: z
      .number()
      .positive('targetPrice must be a positive number')
      .finite('targetPrice must be a finite number')
      .optional(),

    /** Account that owns this request — required for ownership checks. */
    accountId: z.string().uuid('accountId must be a UUID'),
  })
  .refine(
    (data) => {
      return new Date(data.periodStart) < new Date(data.periodEnd);
    },
    {
      message: 'periodStart must be before periodEnd',
      path: ['periodStart'],
    },
  );

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;
