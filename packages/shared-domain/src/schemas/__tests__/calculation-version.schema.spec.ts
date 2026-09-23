import { CalculationVersionSchema } from '../index';

describe('CalculationVersionSchema', () => {
  const validBase = {
    calculationSchemaVersion: '1.0.0' as const,
    calculationId: 'c1c1c1c1-0000-4000-8000-000000000001',
    researchJobId: '11000000-0000-4000-8000-000000000001',
    accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
    formulaName: 'landed_price_v1',
    formulaVersion: '1.0.0',
    inputEvidenceIds: ['e1e1e1e1-0000-4000-8000-000000000001'],
    outputMetric: {
      type: 'landed_price' as const,
      value: 84.49,
      unit: 'USD',
      confidence: 0.92,
    },
    deterministicMethod:
      'weighted median of listed unit prices plus estimated standard shipping for product category',
    createdAt: '2025-01-10T15:00:00Z',
  };

  describe('valid inputs', () => {
    it('accepts a valid calculation version', () => {
      expect(CalculationVersionSchema.safeParse(validBase).success).toBe(true);
    });
  });

  describe('required identifiers (AC-4)', () => {
    it('requires calculationId as a UUID', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, calculationId: 'bad' });
      expect(result.success).toBe(false);
    });

    it('requires formulaName', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, formulaName: '' });
      expect(result.success).toBe(false);
    });

    it('requires formulaVersion in semver format', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, formulaVersion: 'v1' });
      expect(result.success).toBe(false);
    });

    it('requires deterministicMethod', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, deterministicMethod: '' });
      expect(result.success).toBe(false);
    });

    it('requires a valid ISO 8601 createdAt', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, createdAt: '2025-01-10' });
      expect(result.success).toBe(false);
    });
  });

  describe('inputEvidenceIds requirement (AC-4)', () => {
    it('rejects empty inputEvidenceIds for a quantitative output', () => {
      const result = CalculationVersionSchema.safeParse({ ...validBase, inputEvidenceIds: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i: { path: (string | number)[] }) => i.path.join('.'));
        expect(paths).toContain('inputEvidenceIds');
      }
    });

    it('rejects non-UUID inputEvidenceIds', () => {
      const result = CalculationVersionSchema.safeParse({
        ...validBase,
        inputEvidenceIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });

    it('accepts multiple valid evidence IDs', () => {
      const result = CalculationVersionSchema.safeParse({
        ...validBase,
        inputEvidenceIds: [
          'e1e1e1e1-0000-4000-8000-000000000001',
          'e2e2e2e2-0000-4000-8000-000000000002',
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('outputMetric validation (AC-4)', () => {
    it('rejects a non-finite outputMetric value', () => {
      const result = CalculationVersionSchema.safeParse({
        ...validBase,
        outputMetric: { ...validBase.outputMetric, value: NaN },
      });
      expect(result.success).toBe(false);
    });

    it('rejects an invalid outputMetric type', () => {
      const result = CalculationVersionSchema.safeParse({
        ...validBase,
        outputMetric: { ...validBase.outputMetric, type: 'unknown_type' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects confidence outside [0, 1]', () => {
      const result = CalculationVersionSchema.safeParse({
        ...validBase,
        outputMetric: { ...validBase.outputMetric, confidence: 1.5 },
      });
      expect(result.success).toBe(false);
    });
  });
});
