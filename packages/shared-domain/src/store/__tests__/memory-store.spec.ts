import { MemoryDomainStore } from '../memory-store';

describe('MemoryDomainStore', () => {
  let store: MemoryDomainStore;

  beforeEach(() => {
    store = new MemoryDomainStore();
  });

  it('initializes with seed data', () => {
    const stats = store.getStats();
    expect(stats.researchRequests).toBeGreaterThan(0);
    expect(stats.evidenceItems).toBeGreaterThan(0);
    expect(stats.calculationVersions).toBeGreaterThan(0);
    expect(stats.reportVersions).toBeGreaterThan(0);
  });

  describe('Research Requests', () => {
    it('creates a validated research request', () => {
      const created = store.createResearchRequest({
        requestSchemaVersion: '1.0.0',
        query: 'Apple MacBook Pro M3',
        country: 'US',
        currency: 'USD',
        periodStart: '2024-01-01',
        periodEnd: '2024-06-01',
        targetPrice: 1999.0,
        accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
      });

      expect(created.id).toBeDefined();
      expect(created.query).toBe('Apple MacBook Pro M3');

      const fetched = store.getResearchRequest(created.id);
      expect(fetched?.query).toBe('Apple MacBook Pro M3');
    });

    it('rejects an invalid research request', () => {
      expect(() => {
        store.createResearchRequest({
          requestSchemaVersion: '1.0.0',
          query: '', // empty query
          country: 'US',
          currency: 'USD',
          periodStart: '2024-06-01',
          periodEnd: '2024-01-01', // reversed
          accountId: 'bad-uuid',
        });
      }).toThrow();
    });
  });

  describe('Resolved Report', () => {
    it('resolves a report version with its linked evidence and calculations', () => {
      const resolved = store.getResolvedReport('a0a0a0a0-0000-4000-8000-000000000001');
      expect(resolved).toBeDefined();
      expect(resolved?.report.versionId).toBe('a0a0a0a0-0000-4000-8000-000000000001');
      expect(resolved?.evidence.length).toBeGreaterThan(0);
      expect(resolved?.calculations.length).toBeGreaterThan(0);
    });

    it('returns undefined for non-existent report version', () => {
      const resolved = store.getResolvedReport('non-existent');
      expect(resolved).toBeUndefined();
    });
  });
});
