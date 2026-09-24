/**
 * Schema round-trip integration tests.
 *
 * Verifies that JSON fixtures can be serialized and parsed through the public
 * exports of packages/shared-domain/src/schemas/index.ts without any external
 * services or network access.
 *
 * Each test:
 *  1. Reads the fixture (or uses an inline copy of its data)
 *  2. Parses it through the schema
 *  3. JSON-serializes the result and re-parses it to verify round-trip fidelity
 */

import {
  ResearchRequestSchema,
  EvidenceItemSchema,
  ReportVersionSchema,
  CalculationVersionSchema,
} from '../index';

import * as researchRequestValidFixture from '../fixtures/research-request.valid.json';
import * as researchRequestInvalidFixture from '../fixtures/research-request.invalid.json';
import * as evidenceItemValidFixture from '../fixtures/evidence-item.valid.json';
import * as evidenceItemInvalidFixture from '../fixtures/evidence-item.invalid.json';
import * as reportVersionValidFixture from '../fixtures/report-version.valid.json';
import * as reportVersionInvalidFixture from '../fixtures/report-version.invalid.json';
import * as calculationVersionValidFixture from '../fixtures/calculation-version.valid.json';
import * as calculationVersionInvalidFixture from '../fixtures/calculation-version.invalid.json';

describe('Schema round-trip integration tests', () => {
  describe('ResearchRequestSchema', () => {
    it('parses the valid fixture and survives JSON round-trip', () => {
      const result = ResearchRequestSchema.safeParse(researchRequestValidFixture);
      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = JSON.parse(JSON.stringify(result.data));
        const reparsed = ResearchRequestSchema.safeParse(serialized);
        expect(reparsed.success).toBe(true);
      }
    });

    it('rejects the invalid fixture (reversed period)', () => {
      const result = ResearchRequestSchema.safeParse(researchRequestInvalidFixture);
      expect(result.success).toBe(false);
    });
  });

  describe('EvidenceItemSchema', () => {
    it('parses the valid fixture and survives JSON round-trip', () => {
      const result = EvidenceItemSchema.safeParse(evidenceItemValidFixture);
      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = JSON.parse(JSON.stringify(result.data));
        const reparsed = EvidenceItemSchema.safeParse(serialized);
        expect(reparsed.success).toBe(true);
      }
    });

    it('rejects the invalid fixture (missing source provenance and non-numeric metric)', () => {
      const result = EvidenceItemSchema.safeParse(evidenceItemInvalidFixture);
      expect(result.success).toBe(false);
    });
  });

  describe('ReportVersionSchema', () => {
    it('parses the valid fixture and survives JSON round-trip', () => {
      const result = ReportVersionSchema.safeParse(reportVersionValidFixture);
      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = JSON.parse(JSON.stringify(result.data));
        const reparsed = ReportVersionSchema.safeParse(serialized);
        expect(reparsed.success).toBe(true);
      }
    });

    it('rejects the invalid fixture (completed with no evidence IDs)', () => {
      const result = ReportVersionSchema.safeParse(reportVersionInvalidFixture);
      expect(result.success).toBe(false);
    });
  });

  describe('CalculationVersionSchema', () => {
    it('parses the valid fixture and survives JSON round-trip', () => {
      const result = CalculationVersionSchema.safeParse(calculationVersionValidFixture);
      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = JSON.parse(JSON.stringify(result.data));
        const reparsed = CalculationVersionSchema.safeParse(serialized);
        expect(reparsed.success).toBe(true);
      }
    });

    it('rejects the invalid fixture (empty inputEvidenceIds)', () => {
      const result = CalculationVersionSchema.safeParse(calculationVersionInvalidFixture);
      expect(result.success).toBe(false);
    });
  });

  describe('index.ts public exports', () => {
    it('exports ResearchRequestSchema', () => {
      expect(ResearchRequestSchema).toBeDefined();
      expect(typeof ResearchRequestSchema.safeParse).toBe('function');
    });

    it('exports EvidenceItemSchema', () => {
      expect(EvidenceItemSchema).toBeDefined();
      expect(typeof EvidenceItemSchema.safeParse).toBe('function');
    });

    it('exports ReportVersionSchema', () => {
      expect(ReportVersionSchema).toBeDefined();
      expect(typeof ReportVersionSchema.safeParse).toBe('function');
    });

    it('exports CalculationVersionSchema', () => {
      expect(CalculationVersionSchema).toBeDefined();
      expect(typeof CalculationVersionSchema.safeParse).toBe('function');
    });
  });
});
