/**
 * Lightweight Local Development & Testing Server.
 *
 * Runs the domain models and in-memory store locally without external dependencies
 * or a live PostgreSQL database.
 */

import * as http from 'http';
import { URL } from 'url';
import { MemoryDomainStore } from './store/memory-store';
import { ZodError } from 'zod';
import { getHtmlDashboard } from './dashboard';
import { renderFullHtmlReport } from './full-report';

const store = new MemoryDomainStore();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(json);
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const method = req.method;

  try {
    // ── Welcome & Info / Web Dashboard ───────────────────────────────────────
    if ((pathname === '/' || pathname === '/dashboard') && (method === 'GET' || method === 'HEAD')) {
      const accept = req.headers.accept || '';
      if (!accept.includes('application/json') || accept.includes('text/html')) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(getHtmlDashboard());
        return;
      }

      sendJson(res, 200, {
        name: 'Market Campass — Local Domain Runner',
        status: 'running',
        environment: 'local (in-memory model store)',
        dashboard: `http://${req.headers.host || 'localhost:3000'}/`,
        endpoints: [
          'GET  /api/health',
          'GET  /api/research-requests',
          'POST /api/research-requests',
          'GET  /api/evidence',
          'POST /api/evidence',
          'GET  /api/calculations',
          'POST /api/calculations',
          'GET  /api/reports',
          'POST /api/reports',
          'GET  /api/reports/:id (resolved with linked evidence & calculations)',
        ],
        stats: store.getStats(),
      });
      return;
    }

    // ── Full Consolidated One-Page HTML Report ───────────────────────────────
    if (pathname === '/report/full' && (method === 'GET' || method === 'HEAD')) {
      const allResolved = store.getAllResolvedReports();
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(renderFullHtmlReport(allResolved));
      return;
    }

    // ── Health ────────────────────────────────────────────────────────────────
    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        stats: store.getStats(),
      });
      return;
    }

    // ── Research Requests ─────────────────────────────────────────────────────
    if (pathname === '/api/research-requests') {
      if (method === 'GET') {
        sendJson(res, 200, store.listResearchRequests());
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const created = store.createResearchRequest(body);
        const autoGen = reqUrl.searchParams.get('autoGenerateReport') !== 'false';
        let generatedReport = undefined;
        if (autoGen) {
          generatedReport = store.generateReportForRequest(created.id);
        }
        sendJson(res, 201, {
          request: created,
          report: generatedReport,
        });
        return;
      }
    }

    const genMatch = pathname.match(/^\/api\/research-requests\/([^/]+)\/generate-report$/);
    if (genMatch && method === 'POST') {
      const reqId = genMatch[1];
      const resolved = store.generateReportForRequest(reqId);
      sendJson(res, 201, resolved);
      return;
    }

    // ── Evidence Items ────────────────────────────────────────────────────────
    if (pathname === '/api/evidence') {
      if (method === 'GET') {
        const researchJobId = reqUrl.searchParams.get('researchJobId') || undefined;
        const evidenceType = reqUrl.searchParams.get('evidenceType') || undefined;
        sendJson(res, 200, store.listEvidenceItems({ researchJobId, evidenceType }));
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const created = store.createEvidenceItem(body);
        sendJson(res, 201, created);
        return;
      }
    }

    // ── Calculations ──────────────────────────────────────────────────────────
    if (pathname === '/api/calculations') {
      if (method === 'GET') {
        const researchJobId = reqUrl.searchParams.get('researchJobId') || undefined;
        sendJson(res, 200, store.listCalculationVersions({ researchJobId }));
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const created = store.createCalculationVersion(body);
        sendJson(res, 201, created);
        return;
      }
    }

    // ── Reports ───────────────────────────────────────────────────────────────
    if (pathname === '/api/reports/resolved/all' && method === 'GET') {
      sendJson(res, 200, store.getAllResolvedReports());
      return;
    }

    if (pathname === '/api/reports' && method === 'GET') {
      sendJson(res, 200, store.listReportVersions());
      return;
    }

    if (pathname === '/api/reports' && method === 'POST') {
      const body = await readBody(req);
      const created = store.createReportVersion(body);
      sendJson(res, 201, created);
      return;
    }

    const reportMatch = pathname.match(/^\/api\/reports\/([^/]+)$/);
    if (reportMatch && method === 'GET') {
      const versionId = reportMatch[1];
      const resolved = store.getResolvedReport(versionId);
      if (!resolved) {
        sendJson(res, 404, { error: 'ReportVersion not found', versionId });
        return;
      }
      sendJson(res, 200, resolved);
      return;
    }

    // ── Not Found ─────────────────────────────────────────────────────────────
    sendJson(res, 404, { error: 'Not Found', path: pathname });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      sendJson(res, 400, {
        error: 'Schema Validation Error',
        issues: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      });
      return;
    }

    sendJson(res, 500, {
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Market Campass] Local Domain Server running on http://localhost:${PORT}`);
    console.log(`[Market Campass] In-memory store initialized with seed records.`);
    console.log(`[Market Campass] Health: http://localhost:${PORT}/api/health`);
  });
}

export { server, store };
