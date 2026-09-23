import { ResearchRequestSchema } from '../index';

describe('ResearchRequestSchema', () => {
  const validBase = {
    requestSchemaVersion: '1.0.0' as const,
    query: 'Logitech MX Master 3 wireless mouse',
    country: 'US',
    currency: 'USD',
    periodStart: '2024-10-01',
    periodEnd: '2025-01-01',
    accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
  };

  describe('valid inputs', () => {
    it('accepts a minimal valid research request', () => {
      expect(ResearchRequestSchema.safeParse(validBase).success).toBe(true);
    });

    it('accepts a request with an optional targetPrice', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, targetPrice: 79.99 });
      expect(result.success).toBe(true);
    });
  });

  describe('one-country and one-currency constraint', () => {
    it('rejects a request without a country', () => {
      const { country: _c, ...noCountry } = validBase;
      const result = ResearchRequestSchema.safeParse(noCountry);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid country code (lowercase)', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, country: 'us' });
      expect(result.success).toBe(false);
    });

    it('rejects a request without a currency', () => {
      const { currency: _c, ...noCurrency } = validBase;
      const result = ResearchRequestSchema.safeParse(noCurrency);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid currency code (2-letter)', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, currency: 'US' });
      expect(result.success).toBe(false);
    });
  });

  describe('period validation', () => {
    it('rejects when periodStart is after periodEnd', () => {
      const result = ResearchRequestSchema.safeParse({
        ...validBase,
        periodStart: '2025-03-01',
        periodEnd: '2024-01-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i: { path: (string | number)[] }) => i.path.join('.'));
        expect(paths).toContain('periodStart');
      }
    });

    it('rejects a missing periodStart', () => {
      const { periodStart: _p, ...noPeriodStart } = validBase;
      expect(ResearchRequestSchema.safeParse(noPeriodStart).success).toBe(false);
    });
  });

  describe('targetPrice validation', () => {
    it('rejects a negative targetPrice', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, targetPrice: -10 });
      expect(result.success).toBe(false);
    });

    it('rejects a zero targetPrice', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, targetPrice: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects a non-finite targetPrice (Infinity)', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, targetPrice: Infinity });
      expect(result.success).toBe(false);
    });
  });

  describe('required field validation', () => {
    it('rejects an empty query', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, query: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing accountId', () => {
      const { accountId: _a, ...noAccount } = validBase;
      expect(ResearchRequestSchema.safeParse(noAccount).success).toBe(false);
    });

    it('rejects an invalid accountId (not a UUID)', () => {
      const result = ResearchRequestSchema.safeParse({ ...validBase, accountId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });
  });
});
