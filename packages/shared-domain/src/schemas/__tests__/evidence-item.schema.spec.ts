import { EvidenceItemSchema } from '../index';

describe('EvidenceItemSchema', () => {
  const validBase = {
    evidenceSchemaVersion: '1.0.0' as const,
    evidenceId: 'e1e1e1e1-0000-4000-8000-000000000001',
    researchJobId: '11000000-0000-4000-8000-000000000001',
    accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
    source: {
      provider: 'Amazon SP-API',
      url: 'https://www.amazon.com/dp/B08C7KG5LP',
    },
    collectedAt: '2025-01-10T14:30:00Z',
    geography: {
      country: 'US',
    },
    observationPeriod: {
      startDate: '2024-10-01',
      endDate: '2025-01-01',
    },
    metric: {
      name: 'unit_price',
      value: 79.99,
      unit: 'USD',
    },
    evidenceType: 'price_observation' as const,
  };

  describe('valid inputs', () => {
    it('accepts a valid evidence item with provider and url', () => {
      expect(EvidenceItemSchema.safeParse(validBase).success).toBe(true);
    });

    it('accepts a valid evidence item with provider only', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        source: { provider: 'SimilarWeb' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid evidence item with url only', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        source: { url: 'https://www.bestbuy.com/product/12345' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('source provenance requirement (AC-2)', () => {
    it('requires source.provider or source.url', () => {
      const result = EvidenceItemSchema.safeParse({ ...validBase, source: {} });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i: { message: string }) => i.message);
        expect(messages.some((m: string) => m.includes('provider') || m.includes('url'))).toBe(true);
      }
    });

    it('requires source.url to use HTTPS', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        source: { url: 'http://example.com/product' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('required fields (AC-2)', () => {
    it('requires collectedAt', () => {
      const { collectedAt: _c, ...noCollectedAt } = validBase;
      expect(EvidenceItemSchema.safeParse(noCollectedAt).success).toBe(false);
    });

    it('requires geography.country', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        geography: {},
      });
      expect(result.success).toBe(false);
    });

    it('requires observationPeriod.startDate', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        observationPeriod: { endDate: '2025-01-01' },
      });
      expect(result.success).toBe(false);
    });

    it('requires observationPeriod.endDate', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        observationPeriod: { startDate: '2024-10-01' },
      });
      expect(result.success).toBe(false);
    });

    it('requires metric.name', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        metric: { name: '', value: 1, unit: 'USD' },
      });
      expect(result.success).toBe(false);
    });

    it('requires metric.value to be a number', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        metric: { name: 'unit_price', value: 'not-a-number', unit: 'USD' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-finite metric.value', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        metric: { name: 'unit_price', value: NaN, unit: 'USD' },
      });
      expect(result.success).toBe(false);
    });

    it('requires metric.unit', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        metric: { name: 'unit_price', value: 79.99, unit: '' },
      });
      expect(result.success).toBe(false);
    });

    it('requires evidenceType', () => {
      const { evidenceType: _e, ...noType } = validBase;
      expect(EvidenceItemSchema.safeParse(noType).success).toBe(false);
    });
  });

  describe('observation period validation', () => {
    it('rejects reversed observation period', () => {
      const result = EvidenceItemSchema.safeParse({
        ...validBase,
        observationPeriod: { startDate: '2025-06-01', endDate: '2024-01-01' },
      });
      expect(result.success).toBe(false);
    });
  });
});
