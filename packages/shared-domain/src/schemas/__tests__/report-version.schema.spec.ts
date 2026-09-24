import { ReportVersionSchema } from '../index';

describe('ReportVersionSchema', () => {
  const validCompleted = {
    reportSchemaVersion: '1.0.0' as const,
    versionId: 'a0a0a0a0-0000-4000-8000-000000000001',
    accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
    researchJobId: '11000000-0000-4000-8000-000000000001',
    status: 'completed' as const,
    createdAt: '2025-01-10T16:00:00Z',
    evidenceIds: ['e1e1e1e1-0000-4000-8000-000000000001'],
    calculationVersionIds: ['c1c1c1c1-0000-4000-8000-000000000001'],
    confidenceLabel: 'high' as const,
    missingDataExplanations: [],
  };

  describe('valid inputs', () => {
    it('accepts a valid completed report version', () => {
      expect(ReportVersionSchema.safeParse(validCompleted).success).toBe(true);
    });

    it('accepts a valid partial report with missing data explanations', () => {
      const result = ReportVersionSchema.safeParse({
        ...validCompleted,
        status: 'partial',
        missingDataExplanations: [
          { area: 'pricing', reason: 'Amazon SP-API rate limited', impactsConclusions: true },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('immutable version fields (AC-3)', () => {
    it('requires versionId as a UUID', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, versionId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('requires accountId as a UUID', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, accountId: 'bad' });
      expect(result.success).toBe(false);
    });

    it('requires researchJobId as a UUID', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, researchJobId: 'bad' });
      expect(result.success).toBe(false);
    });

    it('requires a valid ISO 8601 createdAt', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, createdAt: '2025-01-10' });
      expect(result.success).toBe(false);
    });
  });

  describe('lineage requirements (AC-3)', () => {
    it('requires evidenceIds array', () => {
      const { evidenceIds: _e, ...noIds } = validCompleted;
      expect(ReportVersionSchema.safeParse(noIds).success).toBe(false);
    });

    it('requires calculationVersionIds array', () => {
      const { calculationVersionIds: _c, ...noCalcIds } = validCompleted;
      expect(ReportVersionSchema.safeParse(noCalcIds).success).toBe(false);
    });

    it('rejects a completed report with empty evidenceIds', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, evidenceIds: [] });
      expect(result.success).toBe(false);
    });

    it('requires confidenceLabel', () => {
      const { confidenceLabel: _c, ...noLabel } = validCompleted;
      expect(ReportVersionSchema.safeParse(noLabel).success).toBe(false);
    });

    it('requires missingDataExplanations array', () => {
      const { missingDataExplanations: _m, ...noExpl } = validCompleted;
      expect(ReportVersionSchema.safeParse(noExpl).success).toBe(false);
    });

    it('rejects a partial report without any missingDataExplanations', () => {
      const result = ReportVersionSchema.safeParse({
        ...validCompleted,
        status: 'partial',
        evidenceIds: ['e1e1e1e1-0000-4000-8000-000000000001'],
        missingDataExplanations: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects a completed report with missingDataExplanations', () => {
      const result = ReportVersionSchema.safeParse({
        ...validCompleted,
        missingDataExplanations: [
          { area: 'pricing', reason: 'connector failed', impactsConclusions: false },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('status validation', () => {
    it('rejects an invalid status', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, status: 'draft' });
      expect(result.success).toBe(false);
    });
  });

  describe('schema version', () => {
    it('requires reportSchemaVersion to be the literal "1.0.0"', () => {
      const result = ReportVersionSchema.safeParse({ ...validCompleted, reportSchemaVersion: '2.0.0' });
      expect(result.success).toBe(false);
    });
  });
});
