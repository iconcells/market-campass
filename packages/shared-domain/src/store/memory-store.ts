/**
 * In-Memory Model Store & Repository for Local Development and Testing.
 *
 * Allows developers to run and test domain models, validation rules,
 * and lineage queries locally without needing an active PostgreSQL instance.
 */

import * as crypto from 'crypto';
import {
  ResearchRequestSchema,
  ResearchRequest,
  EvidenceItemSchema,
  EvidenceItem,
  CalculationVersionSchema,
  CalculationVersion,
  ReportVersionSchema,
  ReportVersion,
} from '../schemas';

export interface StoreStats {
  researchRequests: number;
  evidenceItems: number;
  calculationVersions: number;
  reportVersions: number;
}

export interface ResolvedReport {
  report: ReportVersion;
  evidence: EvidenceItem[];
  calculations: CalculationVersion[];
}

export class MemoryDomainStore {
  private researchRequests = new Map<string, ResearchRequest & { id: string }>();
  private evidenceItems = new Map<string, EvidenceItem>();
  private calculationVersions = new Map<string, CalculationVersion>();
  private reportVersions = new Map<string, ReportVersion>();

  constructor() {
    this.seedDefaults();
  }

  // ── Research Requests ───────────────────────────────────────────────────────

  createResearchRequest(data: unknown): ResearchRequest & { id: string } {
    const validated = ResearchRequestSchema.parse(data);
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record = { ...validated, id };
    this.researchRequests.set(id, record);
    return record;
  }

  getResearchRequest(id: string): (ResearchRequest & { id: string }) | undefined {
    return this.researchRequests.get(id);
  }

  listResearchRequests(): (ResearchRequest & { id: string })[] {
    return Array.from(this.researchRequests.values());
  }

  // ── Evidence Items ──────────────────────────────────────────────────────────

  createEvidenceItem(data: unknown): EvidenceItem {
    const validated = EvidenceItemSchema.parse(data);
    this.evidenceItems.set(validated.evidenceId, validated);
    return validated;
  }

  getEvidenceItem(evidenceId: string): EvidenceItem | undefined {
    return this.evidenceItems.get(evidenceId);
  }

  listEvidenceItems(filter?: { researchJobId?: string; evidenceType?: string }): EvidenceItem[] {
    let items = Array.from(this.evidenceItems.values());
    if (filter?.researchJobId) {
      items = items.filter((item) => item.researchJobId === filter.researchJobId);
    }
    if (filter?.evidenceType) {
      items = items.filter((item) => item.evidenceType === filter.evidenceType);
    }
    return items;
  }

  // ── Calculation Versions ────────────────────────────────────────────────────

  createCalculationVersion(data: unknown): CalculationVersion {
    const validated = CalculationVersionSchema.parse(data);
    this.calculationVersions.set(validated.calculationId, validated);
    return validated;
  }

  getCalculationVersion(calculationId: string): CalculationVersion | undefined {
    return this.calculationVersions.get(calculationId);
  }

  listCalculationVersions(filter?: { researchJobId?: string }): CalculationVersion[] {
    let items = Array.from(this.calculationVersions.values());
    if (filter?.researchJobId) {
      items = items.filter((c) => c.researchJobId === filter.researchJobId);
    }
    return items;
  }

  // ── Report Versions ─────────────────────────────────────────────────────────

  createReportVersion(data: unknown): ReportVersion {
    const validated = ReportVersionSchema.parse(data);
    this.reportVersions.set(validated.versionId, validated);
    return validated;
  }

  getReportVersion(versionId: string): ReportVersion | undefined {
    return this.reportVersions.get(versionId);
  }

  listReportVersions(): ReportVersion[] {
    return Array.from(this.reportVersions.values());
  }

  /**
   * Stitches an immutable report version with all linked evidence and calculations.
   */
  getResolvedReport(versionId: string): ResolvedReport | undefined {
    const report = this.getReportVersion(versionId);
    if (!report) return undefined;

    const evidence = report.evidenceIds
      .map((id) => this.getEvidenceItem(id))
      .filter((e): e is EvidenceItem => e !== undefined);

    const calculations = report.calculationVersionIds
      .map((id) => this.getCalculationVersion(id))
      .filter((c): c is CalculationVersion => c !== undefined);

    return {
      report,
      evidence,
      calculations,
    };
  }

  /**
   * Retrieves all report versions resolved with their linked evidence and calculations.
   */
  getAllResolvedReports(): ResolvedReport[] {
    const reports = this.listReportVersions();
    return reports
      .map((r) => this.getResolvedReport(r.versionId))
      .filter((r): r is ResolvedReport => r !== undefined);
  }

  /**
   * Simulates the downstream research worker pipeline for a research request:
   * 1. Collects mock evidence (price observation from Amazon SP-API / Google Shopping)
   * 2. Calculates deterministic landed price
   * 3. Creates an immutable ReportVersion
   */
  generateReportForRequest(requestId: string): ResolvedReport {
    const request = this.getResearchRequest(requestId);
    if (!request) {
      throw new Error(`Research request not found: ${requestId}`);
    }

    const jobId = crypto.randomUUID();
    const evidencePriceId = crypto.randomUUID();
    const evidenceSearchId = crypto.randomUUID();
    const evidenceDemoId = crypto.randomUUID();
    const evidenceSalesId = crypto.randomUUID();

    const calcLandedId = crypto.randomUUID();
    const calcRangeId = crypto.randomUUID();
    const calcDemandId = crypto.randomUUID();
    const calcDemoId = crypto.randomUUID();
    const reportVersionId = crypto.randomUUID();

    const basePrice = request.targetPrice ?? 99.99;
    const observationPrice = Math.round(basePrice * 100) / 100;
    const landedPrice = Math.round((observationPrice + 5.99) * 100) / 100;
    const lowPrice = Math.round(observationPrice * 0.82 * 100) / 100;
    const highPrice = Math.round(observationPrice * 1.22 * 100) / 100;

    // 1. Evidence: Price Observation
    const evPrice = this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: evidencePriceId,
      researchJobId: jobId,
      accountId: request.accountId,
      source: {
        provider: 'Amazon SP-API',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(request.query)}`,
      },
      collectedAt: new Date().toISOString(),
      geography: { country: request.country },
      observationPeriod: { startDate: request.periodStart, endDate: request.periodEnd },
      metric: { name: 'unit_price', value: observationPrice, unit: request.currency, sampleSize: 1 },
      evidenceType: 'price_observation',
    });

    // 2. Evidence: Search Volume & Frequency from Search Engine
    const evSearch = this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: evidenceSearchId,
      researchJobId: jobId,
      accountId: request.accountId,
      source: {
        provider: 'Google Search & Trends Intelligence',
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(request.query)}&geo=${request.country}`,
      },
      collectedAt: new Date().toISOString(),
      geography: { country: request.country },
      observationPeriod: { startDate: request.periodStart, endDate: request.periodEnd },
      metric: { name: 'monthly_search_volume', value: 48500, unit: 'queries/month', sampleSize: 48500 },
      evidenceType: 'search_volume',
    });

    // 3. Evidence: Shopper Demographics
    const evDemo = this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: evidenceDemoId,
      researchJobId: jobId,
      accountId: request.accountId,
      source: {
        provider: 'Consumer Purchase Demographics Registry',
        url: 'https://intelligence.softwareforge.ai/api/v1/demographics',
      },
      collectedAt: new Date().toISOString(),
      geography: { country: request.country },
      observationPeriod: { startDate: request.periodStart, endDate: request.periodEnd },
      metric: { name: 'median_shopper_age', value: 31, unit: 'years', sampleSize: 1420 },
      evidenceType: 'demographic_aggregate',
    });

    // 4. Evidence: Sales Rank & Volatility
    const evSales = this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: evidenceSalesId,
      researchJobId: jobId,
      accountId: request.accountId,
      source: {
        provider: 'E-commerce BSR Tracker',
        url: 'https://www.amazon.com/gp/bestsellers',
      },
      collectedAt: new Date().toISOString(),
      geography: { country: request.country },
      observationPeriod: { startDate: request.periodStart, endDate: request.periodEnd },
      metric: { name: 'category_sales_rank', value: 24, unit: 'rank', sampleSize: 30 },
      evidenceType: 'sales_rank',
    });

    // Calculations
    const calcLanded = this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: calcLandedId,
      researchJobId: jobId,
      accountId: request.accountId,
      formulaName: 'landed_price_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [evidencePriceId],
      outputMetric: { type: 'landed_price', value: landedPrice, unit: request.currency, confidence: 0.94 },
      deterministicMethod: 'weighted median of listed unit prices plus estimated shipping and standard tax',
      createdAt: new Date().toISOString(),
    });

    const calcRange = this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: calcRangeId,
      researchJobId: jobId,
      accountId: request.accountId,
      formulaName: 'sales_price_range_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [evidencePriceId, evidenceSalesId],
      outputMetric: {
        type: 'price_distribution',
        value: observationPrice,
        unit: request.currency,
        confidence: 0.92,
        limitations: JSON.stringify({ lowPrice, benchmarkPrice: landedPrice, highPrice, peakRank: 12, troughRank: 68 }),
      },
      deterministicMethod: 'historical 52-week pricing distribution and sales rank volatility boundaries',
      createdAt: new Date().toISOString(),
    });

    const calcDemand = this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: calcDemandId,
      researchJobId: jobId,
      accountId: request.accountId,
      formulaName: 'search_engine_frequency_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [evidenceSearchId],
      outputMetric: {
        type: 'demand_index',
        value: 86.5,
        unit: 'index',
        confidence: 0.95,
        limitations: JSON.stringify({
          monthlyVolume: 48500,
          dailyAverage: 1616,
          searchGrowthYoY: '+18.4%',
          highSearchMonth: 68000,
          lowSearchMonth: 22000,
          searchAgeBrackets: { '18-24': 25, '25-34': 46, '35-44': 18, '45-54': 8, '55+': 3 }
        }),
      },
      deterministicMethod: 'search engine keyword query velocity, seasonal acceleration, and daily search frequency index',
      createdAt: new Date().toISOString(),
    });

    const calcDemo = this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: calcDemoId,
      researchJobId: jobId,
      accountId: request.accountId,
      formulaName: 'shopper_demographics_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [evidenceDemoId],
      outputMetric: {
        type: 'demographic_confidence',
        value: 0.96,
        unit: 'score',
        confidence: 0.96,
        limitations: JSON.stringify({
          shopperAgeBrackets: { '18-24': 18, '25-34': 42, '35-44': 24, '45-54': 11, '55+': 5 },
          primarySegment: '25-34 years (Digital Professionals)',
          sampleSize: 1420
        }),
      },
      deterministicMethod: 'aggregate demographic cell distribution with cell suppression threshold ≥ 30',
      createdAt: new Date().toISOString(),
    });

    // Report Version
    const report = this.createReportVersion({
      reportSchemaVersion: '1.0.0',
      versionId: reportVersionId,
      accountId: request.accountId,
      researchJobId: jobId,
      status: 'completed',
      createdAt: new Date().toISOString(),
      evidenceIds: [evidencePriceId, evidenceSearchId, evidenceDemoId, evidenceSalesId],
      calculationVersionIds: [calcLandedId, calcRangeId, calcDemandId, calcDemoId],
      confidenceLabel: 'high',
      missingDataExplanations: [],
      title: `Market Research Report: ${request.query} — ${request.country} (${request.currency})`,
      country: request.country,
      currency: request.currency,
    });

    return {
      report,
      evidence: [evPrice, evSearch, evDemo, evSales],
      calculations: [calcLanded, calcRange, calcDemand, calcDemo],
    };
  }

  // ── Store Utilities ─────────────────────────────────────────────────────────

  getStats(): StoreStats {
    return {
      researchRequests: this.researchRequests.size,
      evidenceItems: this.evidenceItems.size,
      calculationVersions: this.calculationVersions.size,
      reportVersions: this.reportVersions.size,
    };
  }

  clear(): void {
    this.researchRequests.clear( );
    this.evidenceItems.clear();
    this.calculationVersions.clear();
    this.reportVersions.clear();
  }

  seedDefaults(): void {
    const sampleAccountId = 'aaaaaaaa-0000-4000-8000-000000000001';
    const sampleJobId = '11000000-0000-4000-8000-000000000001';
    const sampleEvidencePriceId = 'e1e1e1e1-0000-4000-8000-000000000001';
    const sampleEvidenceSearchId = 'e1e1e1e1-0000-4000-8000-000000000002';
    const sampleEvidenceDemoId = 'e1e1e1e1-0000-4000-8000-000000000003';
    const sampleEvidenceSalesId = 'e1e1e1e1-0000-4000-8000-000000000004';

    const sampleCalcLandedId = 'c1c1c1c1-0000-4000-8000-000000000001';
    const sampleCalcRangeId = 'c1c1c1c1-0000-4000-8000-000000000002';
    const sampleCalcSearchId = 'c1c1c1c1-0000-4000-8000-000000000003';
    const sampleCalcDemoId = 'c1c1c1c1-0000-4000-8000-000000000004';
    const sampleReportId = 'a0a0a0a0-0000-4000-8000-000000000001';

    // 1. Seed request
    this.createResearchRequest({
      requestSchemaVersion: '1.0.0',
      query: 'Logitech MX Master 3 wireless mouse',
      country: 'US',
      currency: 'USD',
      periodStart: '2024-10-01',
      periodEnd: '2025-01-01',
      targetPrice: 79.99,
      accountId: sampleAccountId,
    });

    // 2. Seed price evidence
    this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: sampleEvidencePriceId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      source: {
        provider: 'Amazon SP-API',
        url: 'https://www.amazon.com/dp/B08C7KG5LP',
      },
      collectedAt: '2025-01-10T14:30:00Z',
      geography: { country: 'US', region: 'CA' },
      observationPeriod: { startDate: '2024-10-01', endDate: '2025-01-01' },
      metric: { name: 'unit_price', value: 79.99, unit: 'USD', sampleSize: 1 },
      evidenceType: 'price_observation',
    });

    // 3. Seed search volume evidence
    this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: sampleEvidenceSearchId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      source: {
        provider: 'Google Search & Trends Intelligence',
        url: 'https://trends.google.com/trends/explore?q=Logitech+MX+Master+3&geo=US',
      },
      collectedAt: '2025-01-10T14:30:00Z',
      geography: { country: 'US' },
      observationPeriod: { startDate: '2024-10-01', endDate: '2025-01-01' },
      metric: { name: 'monthly_search_volume', value: 54200, unit: 'queries/month', sampleSize: 54200 },
      evidenceType: 'search_volume',
    });

    // 4. Seed demographic aggregate evidence
    this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: sampleEvidenceDemoId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      source: {
        provider: 'Consumer Purchase Demographics Registry',
        url: 'https://intelligence.softwareforge.ai/api/v1/demographics',
      },
      collectedAt: '2025-01-10T14:30:00Z',
      geography: { country: 'US' },
      observationPeriod: { startDate: '2024-10-01', endDate: '2025-01-01' },
      metric: { name: 'median_shopper_age', value: 32, unit: 'years', sampleSize: 2150 },
      evidenceType: 'demographic_aggregate',
    });

    // 5. Seed sales rank evidence
    this.createEvidenceItem({
      evidenceSchemaVersion: '1.0.0',
      evidenceId: sampleEvidenceSalesId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      source: {
        provider: 'E-commerce BSR Tracker',
        url: 'https://www.amazon.com/gp/bestsellers/electronics',
      },
      collectedAt: '2025-01-10T14:30:00Z',
      geography: { country: 'US' },
      observationPeriod: { startDate: '2024-10-01', endDate: '2025-01-01' },
      metric: { name: 'category_sales_rank', value: 16, unit: 'rank', sampleSize: 30 },
      evidenceType: 'sales_rank',
    });

    // Calculations
    this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: sampleCalcLandedId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      formulaName: 'landed_price_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [sampleEvidencePriceId],
      outputMetric: {
        type: 'landed_price',
        value: 84.49,
        unit: 'USD',
        confidence: 0.94,
      },
      deterministicMethod: 'weighted median of listed unit prices plus estimated standard shipping',
      createdAt: '2025-01-10T15:00:00Z',
    });

    this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: sampleCalcRangeId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      formulaName: 'sales_price_range_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [sampleEvidencePriceId, sampleEvidenceSalesId],
      outputMetric: {
        type: 'price_distribution',
        value: 79.99,
        unit: 'USD',
        confidence: 0.93,
        limitations: JSON.stringify({ lowPrice: 69.99, benchmarkPrice: 84.49, highPrice: 99.99, peakRank: 8, troughRank: 45 }),
      },
      deterministicMethod: 'historical 52-week pricing distribution and sales rank volatility boundaries',
      createdAt: '2025-01-10T15:00:00Z',
    });

    this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: sampleCalcSearchId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      formulaName: 'search_engine_frequency_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [sampleEvidenceSearchId],
      outputMetric: {
        type: 'demand_index',
        value: 88.2,
        unit: 'index',
        confidence: 0.95,
        limitations: JSON.stringify({
          monthlyVolume: 54200,
          dailyAverage: 1806,
          searchGrowthYoY: '+21.5%',
          highSearchMonth: 72000,
          lowSearchMonth: 28000,
          searchAgeBrackets: { '18-24': 22, '25-34': 48, '35-44': 19, '45-54': 8, '55+': 3 }
        }),
      },
      deterministicMethod: 'search engine keyword query velocity, seasonal acceleration, and daily search frequency index',
      createdAt: '2025-01-10T15:00:00Z',
    });

    this.createCalculationVersion({
      calculationSchemaVersion: '1.0.0',
      calculationId: sampleCalcDemoId,
      researchJobId: sampleJobId,
      accountId: sampleAccountId,
      formulaName: 'shopper_demographics_v1',
      formulaVersion: '1.0.0',
      inputEvidenceIds: [sampleEvidenceDemoId],
      outputMetric: {
        type: 'demographic_confidence',
        value: 0.97,
        unit: 'score',
        confidence: 0.97,
        limitations: JSON.stringify({
          shopperAgeBrackets: { '18-24': 15, '25-34': 45, '35-44': 25, '45-54': 10, '55+': 5 },
          primarySegment: '25-34 years (Designers, Developers, & Remote Professionals)',
          sampleSize: 2150
        }),
      },
      deterministicMethod: 'aggregate demographic cell distribution with cell suppression threshold ≥ 30',
      createdAt: '2025-01-10T15:00:00Z',
    });

    // Seed report
    this.createReportVersion({
      reportSchemaVersion: '1.0.0',
      versionId: sampleReportId,
      accountId: sampleAccountId,
      researchJobId: sampleJobId,
      status: 'completed',
      createdAt: '2025-01-10T16:00:00Z',
      evidenceIds: [sampleEvidencePriceId, sampleEvidenceSearchId, sampleEvidenceDemoId, sampleEvidenceSalesId],
      calculationVersionIds: [sampleCalcLandedId, sampleCalcRangeId, sampleCalcSearchId, sampleCalcDemoId],
      confidenceLabel: 'high',
      missingDataExplanations: [],
      title: 'Market Research Report: Logitech MX Master 3 — US Q4 2024',
      country: 'US',
      currency: 'USD',
    });
  }
}
