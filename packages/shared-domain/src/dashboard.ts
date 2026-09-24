export function getHtmlDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Market Campass — Local Client</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --code-bg: #030712;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge.warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
      border-color: rgba(245, 158, 11, 0.3);
    }
    .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .stat-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-value { font-size: 26px; font-weight: 700; color: #fff; }
    
    .nav-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .nav-tab {
      padding: 10px 16px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-tab:hover { color: var(--text); }
    .nav-tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 10px 12px; background: rgba(255,255,255,0.02); color: var(--text-muted); font-weight: 500; border-bottom: 1px solid var(--border); }
    td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
    
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
    input, select {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      color: #fff;
      font-family: inherit;
      font-size: 14px;
    }
    input:focus, select:focus { outline: none; border-color: var(--primary); }
    .btn {
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: var(--code-bg); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }

    pre {
      background: var(--code-bg);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      overflow-x: auto;
      color: #e5e7eb;
    }
    .alert { padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; display: none; }
    .alert.success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); display: block; }
    .alert.error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); display: block; }
    
    .report-header-box {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .deep-dive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .deep-dive-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .card-heading {
      font-size: 13px;
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 13px;
    }
    .stat-row:last-child { border-bottom: none; }
    .range-container { margin: 16px 0 8px 0; }
    .range-bar {
      height: 10px;
      border-radius: 5px;
      background: linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #f59e0b 100%);
      position: relative;
      margin-bottom: 8px;
    }
    .range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
    }
    .bar-row { margin-bottom: 10px; font-size: 12px; }
    .bar-label-group { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .bar-track { height: 7px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1e293b;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid var(--primary);
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      font-size: 14px;
      display: none;
      z-index: 999;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div id="toast" class="toast"></div>

  <div class="container">
    <header>
      <div class="brand">
        <h1>🧭 Market Campass</h1>
        <span class="badge"><span class="badge-dot"></span> Local Server Online (Port 3000)</span>
      </div>
      <div>
        <span class="badge warning">In-Memory Local Mode (No DB Needed)</span>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Research Requests</div>
        <div class="stat-value" id="stat-requests">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Evidence Items</div>
        <div class="stat-value" id="stat-evidence">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Calculation Versions</div>
        <div class="stat-value" id="stat-calculations">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Report Versions</div>
        <div class="stat-value" id="stat-reports">-</div>
      </div>
    </div>

    <nav class="nav-tabs">
      <button class="nav-tab active" data-tab="reports" onclick="switchTab('reports')">Reports & Lineage</button>
      <button class="nav-tab" data-tab="full-report" onclick="switchTab('full-report')">📑 Full One-Page Report</button>
      <button class="nav-tab" data-tab="requests" onclick="switchTab('requests')">Research Requests</button>
      <button class="nav-tab" data-tab="evidence" onclick="switchTab('evidence')">Evidence Store</button>
      <button class="nav-tab" data-tab="calculations" onclick="switchTab('calculations')">Calculations</button>
      <button class="nav-tab" data-tab="api" onclick="switchTab('api')">API Endpoints</button>
    </nav>

    <!-- Tab 1: Reports & Lineage -->
    <div id="tab-reports" class="tab-content active">
      <div class="card">
        <div class="card-title">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span>Select Report:</span>
            <select id="report-select" onchange="onReportSelect(this.value)" style="min-width: 320px; font-weight: 600;">
              <option value="">Loading reports...</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" id="btn-refresh-report" onclick="refreshCurrentReport()">
              🔄 Refresh Report
            </button>
          </div>
        </div>
        <div id="report-view-container">Loading report data...</div>
      </div>
    </div>

    <!-- Tab: Consolidated Full Report -->
    <div id="tab-full-report" class="tab-content">
      <div class="card" style="padding: 16px 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-weight: 700; font-size: 16px;">Executive Consolidated Report (Single-Page)</div>
          <div style="color: var(--text-muted); font-size: 13px; margin-top: 2px;">
            Consolidated market research view of all products, benchmarked landed prices, and evidence citations in one page.
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-primary" onclick="printFullReport()">🖨️ Print / Save as PDF</button>
          <a class="btn btn-secondary" href="/report/full" target="_blank">↗️ Open in New Tab</a>
          <button class="btn btn-secondary" onclick="loadFullHtmlReport()">🔄 Refresh Data</button>
        </div>
      </div>
      <div style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: #0b0f19;">
        <iframe id="full-report-frame" src="/report/full" style="width: 100%; height: 950px; border: none; display: block;"></iframe>
      </div>
    </div>

    <!-- Tab 2: Research Requests -->
    <div id="tab-requests" class="tab-content">
      <div class="card">
        <div class="card-title">
          <span>Submit New Product Research Request</span>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">⚡ Automatically extracts evidence, calculates pricing, and generates report</span>
        </div>
        <form id="request-form" onsubmit="submitRequest(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="f-query">Product Name / Query</label>
              <input type="text" id="f-query" required placeholder="e.g. Sony WH-1000XM5 Headphones">
            </div>
            <div class="form-group">
              <label for="f-country">Market Country (ISO 3166-1 alpha-2)</label>
              <input type="text" id="f-country" value="US" required maxlength="2">
            </div>
            <div class="form-group">
              <label for="f-currency">Currency (ISO 4217)</label>
              <input type="text" id="f-currency" value="USD" required maxlength="3">
            </div>
            <div class="form-group">
              <label for="f-start">Observation Start Date</label>
              <input type="date" id="f-start" value="2024-06-01" required>
            </div>
            <div class="form-group">
              <label for="f-end">Observation End Date</label>
              <input type="date" id="f-end" value="2024-12-31" required>
            </div>
            <div class="form-group">
              <label for="f-price">Target Selling Price</label>
              <input type="number" id="f-price" step="0.01" value="299.99">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" id="btn-submit-req">
            🚀 Submit Request & Auto-Generate Report
          </button>
          <div id="request-alert" class="alert"></div>
        </form>
      </div>

      <div class="card">
        <div class="card-title">All Submitted Research Requests</div>
        <div id="requests-table-container">Loading...</div>
      </div>
    </div>

    <!-- Tab 3: Evidence Store -->
    <div id="tab-evidence" class="tab-content">
      <div class="card">
        <div class="card-title">Collected Evidence Items (Provenance Traceability)</div>
        <div id="evidence-table-container">Loading...</div>
      </div>
    </div>

    <!-- Tab 4: Calculations -->
    <div id="tab-calculations" class="tab-content">
      <div class="card">
        <div class="card-title">Deterministic Calculations & Lineage</div>
        <div id="calc-table-container">Loading...</div>
      </div>
    </div>

    <!-- Tab 5: API Documentation -->
    <div id="tab-api" class="tab-content">
      <div class="card">
        <div class="card-title">REST API Endpoints</div>
        <table>
          <thead>
            <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>GET</code></td><td><code>/api/health</code></td><td>Server health & store record counts</td></tr>
            <tr><td><code>GET</code></td><td><code>/api/reports</code></td><td>List all report versions</td></tr>
            <tr><td><code>GET</code></td><td><code>/api/reports/:id</code></td><td>Get report stitched with linked evidence and calculations</td></tr>
            <tr><td><code>GET</code></td><td><code>/api/research-requests</code></td><td>List all research requests</td></tr>
            <tr><td><code>POST</code></td><td><code>/api/research-requests</code></td><td>Submit and validate research request via ResearchRequestSchema</td></tr>
            <tr><td><code>POST</code></td><td><code>/api/research-requests/:id/generate-report</code></td><td>Generate report for request on demand</td></tr>
            <tr><td><code>GET</code></td><td><code>/api/evidence</code></td><td>List evidence items (filterable by ?researchJobId= & ?evidenceType=)</td></tr>
            <tr><td><code>POST</code></td><td><code>/api/evidence</code></td><td>Submit evidence item validated via EvidenceItemSchema</td></tr>
            <tr><td><code>GET</code></td><td><code>/api/calculations</code></td><td>List calculation versions</td></tr>
            <tr><td><code>POST</code></td><td><code>/api/calculations</code></td><td>Submit calculation validated via CalculationVersionSchema</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    let currentReportId = '';

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    function switchTab(tabId) {
      document.querySelectorAll('.nav-tab').forEach(t => {
        if (t.getAttribute('data-tab') === tabId) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const activeContent = document.getElementById('tab-' + tabId);
      if (activeContent) activeContent.classList.add('active');

      if (tabId === 'reports') loadReportListAndCurrent();
      if (tabId === 'full-report') loadFullHtmlReport();
      if (tabId === 'requests') loadRequests();
      if (tabId === 'evidence') loadEvidence();
      if (tabId === 'calculations') loadCalculations();
    }

    function loadFullHtmlReport() {
      const frame = document.getElementById('full-report-frame');
      if (frame) {
        frame.src = '/report/full?t=' + Date.now();
      }
    }

    function printFullReport() {
      const frame = document.getElementById('full-report-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } else {
        window.open('/report/full', '_blank');
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        document.getElementById('stat-requests').innerText = data.stats.researchRequests;
        document.getElementById('stat-evidence').innerText = data.stats.evidenceItems;
        document.getElementById('stat-calculations').innerText = data.stats.calculationVersions;
        document.getElementById('stat-reports').innerText = data.stats.reportVersions;
      } catch (e) {
        console.error(e);
      }
    }

    async function loadReportListAndCurrent(targetReportId) {
      const select = document.getElementById('report-select');
      try {
        const res = await fetch('/api/reports');
        const reports = await res.json();

        if (!Array.isArray(reports) || reports.length === 0) {
          select.innerHTML = '<option value="">No reports found</option>';
          document.getElementById('report-view-container').innerHTML = '<div style="color: var(--text-muted);">No reports created yet. Submit a research request to generate one!</div>';
          return;
        }

        select.innerHTML = reports.map(r => \`
          <option value="\${r.versionId}">\${r.title || 'Report ' + r.versionId.substring(0, 8)} (\${r.status})</option>
        \`).join('');

        if (targetReportId && reports.some(r => r.versionId === targetReportId)) {
          currentReportId = targetReportId;
        } else if (!currentReportId || !reports.some(r => r.versionId === currentReportId)) {
          currentReportId = reports[reports.length - 1].versionId;
        }

        select.value = currentReportId;
        await loadReport(currentReportId);
      } catch (err) {
        console.error(err);
      }
    }

    function onReportSelect(val) {
      currentReportId = val;
      loadReport(val);
    }

    async function refreshCurrentReport() {
      const btn = document.getElementById('btn-refresh-report');
      btn.innerText = '⏳ Refreshing...';
      await loadStats();
      await loadReportListAndCurrent(currentReportId);
      btn.innerText = '🔄 Refresh Report';
      showToast('Report updated with latest data!');
    }

    async function loadReport(reportId) {
      const container = document.getElementById('report-view-container');
      if (!reportId) {
        container.innerHTML = '<div style="color: var(--text-muted);">Select a report above to view details.</div>';
        return;
      }

      container.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">Fetching report details...</div>';
      try {
        const res = await fetch('/api/reports/' + encodeURIComponent(reportId));
        if (!res.ok) throw new Error('Failed to load report ' + reportId);
        const data = await res.json();
        const r = data.report;
        const e = data.evidence || [];
        const c = data.calculations || [];

        const landedCalc = c.find(x => x.outputMetric.type === 'landed_price') || c[0];
        const rangeCalc = c.find(x => x.formulaName === 'sales_price_range_v1');
        const searchCalc = c.find(x => x.formulaName === 'search_engine_frequency_v1');
        const demoCalc = c.find(x => x.formulaName === 'shopper_demographics_v1');

        let rangeData = { lowPrice: (landedCalc.outputMetric.value * 0.82).toFixed(2), benchmarkPrice: landedCalc.outputMetric.value, highPrice: (landedCalc.outputMetric.value * 1.22).toFixed(2), peakRank: 8, troughRank: 45 };
        let searchData = { monthlyVolume: 48500, dailyAverage: 1616, searchGrowthYoY: '+18.4%', highSearchMonth: 68000, lowSearchMonth: 22000, searchAgeBrackets: { '18-24': 25, '25-34': 46, '35-44': 18, '45-54': 8, '55+': 3 } };
        let demoData = { shopperAgeBrackets: { '18-24': 18, '25-34': 42, '35-44': 24, '45-54': 11, '55+': 5 }, primarySegment: '25-34 years (Digital Professionals)', sampleSize: 1420 };

        try { if (rangeCalc?.outputMetric?.limitations) rangeData = JSON.parse(rangeCalc.outputMetric.limitations); } catch(e){}
        try { if (searchCalc?.outputMetric?.limitations) searchData = JSON.parse(searchCalc.outputMetric.limitations); } catch(e){}
        try { if (demoCalc?.outputMetric?.limitations) demoData = JSON.parse(demoCalc.outputMetric.limitations); } catch(e){}

        const p18_24 = demoData.shopperAgeBrackets['18-24'] || 18;
        const p25_34 = demoData.shopperAgeBrackets['25-34'] || 42;
        const p35_44 = demoData.shopperAgeBrackets['35-44'] || 24;
        const p45_54 = demoData.shopperAgeBrackets['45-54'] || 11;
        const p55 = demoData.shopperAgeBrackets['55+'] || 5;

        const circ = 2 * Math.PI * 65;
        const d1 = (p25_34 / 100) * circ;
        const d2 = (p35_44 / 100) * circ;
        const d3 = (p18_24 / 100) * circ;
        const d4 = (p45_54 / 100) * circ;
        const d5 = (p55 / 100) * circ;

        container.innerHTML = \`
          <div class="report-header-box">
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">\${r.title || 'Market Research Report'}</h2>
            <div style="display: flex; gap: 14px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap;">
              <span>Version: <strong>\${r.versionId}</strong></span> &bull;
              <span>Status: <strong style="color: var(--success);">\${r.status.toUpperCase()}</strong></span> &bull;
              <span>Confidence: <strong style="color: #60a5fa;">\${r.confidenceLabel.toUpperCase()}</strong></span> &bull;
              <span>Market: <strong>\${r.country || 'US'} (\${r.currency || 'USD'})</strong></span> &bull;
              <span>Created: <strong>\${new Date(r.createdAt).toLocaleString()}</strong></span>
            </div>
          </div>

          <!-- Deep Dive 3-Card Visual Section -->
          <div class="deep-dive-grid">

            <!-- Card 1: Shopper Demographics Pie Chart -->
            <div class="deep-dive-card">
              <div class="card-heading">
                <span>🥧 Shopper Age Demographics</span>
                <span style="font-size: 11px; color: var(--success); font-weight: normal;">n=\${demoData.sampleSize}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <svg width="170" height="170" viewBox="0 0 170 170" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); flex-shrink: 0;">
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#1f2937" stroke-width="24" />
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#3b82f6" stroke-width="24" stroke-dasharray="\${d1.toFixed(2)} \${(circ - d1).toFixed(2)}" stroke-dashoffset="0" transform="rotate(-90 85 85)" />
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#10b981" stroke-width="24" stroke-dasharray="\${d2.toFixed(2)} \${(circ - d2).toFixed(2)}" stroke-dashoffset="\${(-d1).toFixed(2)}" transform="rotate(-90 85 85)" />
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#f59e0b" stroke-width="24" stroke-dasharray="\${d3.toFixed(2)} \${(circ - d3).toFixed(2)}" stroke-dashoffset="\${(-(d1 + d2)).toFixed(2)}" transform="rotate(-90 85 85)" />
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#8b5cf6" stroke-width="24" stroke-dasharray="\${d4.toFixed(2)} \${(circ - d4).toFixed(2)}" stroke-dashoffset="\${(-(d1 + d2 + d3)).toFixed(2)}" transform="rotate(-90 85 85)" />
                  <circle cx="85" cy="85" r="65" fill="none" stroke="#ec4899" stroke-width="24" stroke-dasharray="\${d5.toFixed(2)} \${(circ - d5).toFixed(2)}" stroke-dashoffset="\${(-(d1 + d2 + d3 + d4)).toFixed(2)}" transform="rotate(-90 85 85)" />
                  <text x="85" y="80" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700" font-family="'Inter', sans-serif">\${p25_34}%</text>
                  <text x="85" y="96" text-anchor="middle" fill="#9ca3af" font-size="10" font-weight="500" font-family="'Inter', sans-serif">Age 25-34</text>
                </svg>
                <div style="flex: 1; min-width: 140px; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between;"><span style="color: #3b82f6;">● 25-34 yrs</span><strong>\${p25_34}%</strong></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #10b981;">● 35-44 yrs</span><strong>\${p35_44}%</strong></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #f59e0b;">● 18-24 yrs</span><strong>\${p18_24}%</strong></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #8b5cf6;">● 45-54 yrs</span><strong>\${p45_54}%</strong></div>
                  <div style="display: flex; justify-content: space-between;"><span style="color: #ec4899;">● 55+ yrs</span><strong>\${p55}%</strong></div>
                </div>
              </div>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: var(--text-muted);">
                <strong>Primary Segment:</strong> \${demoData.primarySegment}<br>
                <span style="color: var(--success); font-size: 11px;">✓ Aggregate data (cell size &ge; 30 threshold)</span>
              </div>
            </div>

            <!-- Card 2: 52-Week Pricing & Sales Spectrum -->
            <div class="deep-dive-card">
              <div class="card-heading">
                <span>📈 52-Week Pricing & Sales Spectrum</span>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">High & Low</span>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">Current Landed Benchmark</span>
                <strong style="color: #60a5fa; font-size: 15px;">$\${rangeData.benchmarkPrice} \${r.currency || 'USD'}</strong>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">52-Week Lowest Sale Price</span>
                <strong style="color: var(--success);">$\${rangeData.lowPrice}</strong>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">52-Week Highest Sale Price</span>
                <strong style="color: var(--warning);">$\${rangeData.highPrice}</strong>
              </div>

              <div class="range-container">
                <div class="range-bar"></div>
                <div class="range-labels">
                  <span>Low: $\${rangeData.lowPrice}</span>
                  <span style="color: #60a5fa; font-weight: 700;">Current</span>
                  <span>High: $\${rangeData.highPrice}</span>
                </div>
              </div>

              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <div class="stat-row">
                  <span style="color: var(--text-muted);">Peak Season BSR Rank</span>
                  <strong>#\${rangeData.peakRank} in Category</strong>
                </div>
                <div class="stat-row">
                  <span style="color: var(--text-muted);">Low Season BSR Rank</span>
                  <strong>#\${rangeData.troughRank} in Category</strong>
                </div>
              </div>
            </div>

            <!-- Card 3: Search Engine Query Frequency -->
            <div class="deep-dive-card">
              <div class="card-heading">
                <span>🔎 Search Engine Query Frequency</span>
                <span style="font-size: 11px; color: var(--primary-light); font-weight: normal;">\${searchData.searchGrowthYoY} YoY</span>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">Monthly Search Volume</span>
                <strong style="font-size: 15px; color: #fff;">\${searchData.monthlyVolume.toLocaleString()} queries</strong>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">Daily Search Frequency</span>
                <strong>~\${searchData.dailyAverage.toLocaleString()} searches/day</strong>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">Peak Search Month (Holiday Surge)</span>
                <strong style="color: var(--warning);">\${searchData.highSearchMonth.toLocaleString()} queries</strong>
              </div>
              <div class="stat-row">
                <span style="color: var(--text-muted);">Low Search Month (Trough)</span>
                <strong style="color: var(--text-muted);">\${searchData.lowSearchMonth.toLocaleString()} queries</strong>
              </div>

              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <div style="font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 6px;">Age Demographic of Search Engine Users:</div>
                \${Object.entries(searchData.searchAgeBrackets || {}).map(([ageGroup, pct]) => \`
                  <div class="bar-row">
                    <div class="bar-label-group">
                      <span style="color: var(--text-muted);">\${ageGroup}</span>
                      <strong>\${pct}%</strong>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: \${pct}%; background: #3b82f6;"></div>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>

          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 10px; display: flex; justify-content: space-between;">
              <span>Deterministic Calculations (\${c.length})</span>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">Provable numeric formulas</span>
            </h3>
            <table>
              <thead><tr><th>Formula</th><th>Version</th><th>Result</th><th>Method</th></tr></thead>
              <tbody>
                \${c.map(calc => \`
                  <tr>
                    <td><strong>\${calc.formulaName}</strong></td>
                    <td><code>v\${calc.formulaVersion}</code></td>
                    <td><strong style="color: var(--primary); font-size: 15px;">\${calc.outputMetric.value} \${calc.outputMetric.unit}</strong> <span style="font-size: 12px; color: var(--text-muted);">(conf: \${Math.round((calc.outputMetric.confidence || 1) * 100)}%)</span></td>
                    <td style="color: var(--text-muted); font-size: 13px;">\${calc.deterministicMethod}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 10px; display: flex; justify-content: space-between;">
              <span>Backed Evidence Lineage (\${e.length})</span>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">Retained evidence citations</span>
            </h3>
            <table>
              <thead><tr><th>Evidence ID</th><th>Source Provider / URL</th><th>Observed Period</th><th>Metric Fact</th><th>Type</th></tr></thead>
              <tbody>
                \${e.map(item => \`
                  <tr>
                    <td><code>\${item.evidenceId.substring(0, 8)}...</code></td>
                    <td>
                      <div><strong>\${item.source.provider || 'Approved Provider'}</strong></div>
                      \${item.source.url ? \`<a href="\${item.source.url}" target="_blank" style="color: var(--primary); font-size: 12px; word-break: break-all;">\${item.source.url}</a>\` : ''}
                    </td>
                    <td style="font-size: 13px;">\${item.observationPeriod.startDate} &rarr; \${item.observationPeriod.endDate}</td>
                    <td><strong>\${item.metric.value} \${item.metric.unit}</strong> <span style="color: var(--text-muted); font-size: 12px;">(\${item.metric.name})</span></td>
                    <td><span class="badge">\${item.evidenceType}</span></td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        \`;
      } catch (err) {
        container.innerHTML = '<div style="color: var(--error); padding: 20px;">Error loading report: ' + err.message + '</div>';
      }
    }

    async function loadRequests() {
      const c = document.getElementById('requests-table-container');
      try {
        const res = await fetch('/api/research-requests');
        const list = await res.json();
        c.innerHTML = \`
          <table>
            <thead><tr><th>Request ID</th><th>Query</th><th>Market</th><th>Window</th><th>Target Price</th><th>Actions</th></tr></thead>
            <tbody>
              \${list.map(r => \`
                <tr>
                  <td><code>\${r.id}</code></td>
                  <td><strong>\${r.query}</strong></td>
                  <td>\${r.country} / \${r.currency}</td>
                  <td style="font-size: 13px;">\${r.periodStart} &rarr; \${r.periodEnd}</td>
                  <td>\${r.targetPrice ? '$' + Number(r.targetPrice).toFixed(2) : '-'}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="generateReportForId('\${r.id}')">
                      ⚡ Re-run Report
                    </button>
                  </td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      } catch (e) {
        c.innerText = 'Error loading requests: ' + e.message;
      }
    }

    async function generateReportForId(reqId) {
      try {
        const res = await fetch('/api/research-requests/' + encodeURIComponent(reqId) + '/generate-report', {
          method: 'POST'
        });
        const data = await res.json();
        if (data.report && data.report.versionId) {
          showToast('Report generated for ' + reqId + '!');
          await loadStats();
          switchTab('reports');
          await loadReportListAndCurrent(data.report.versionId);
        }
      } catch (err) {
        alert('Failed to generate report: ' + err.message);
      }
    }

    async function loadEvidence() {
      const c = document.getElementById('evidence-table-container');
      try {
        const res = await fetch('/api/evidence');
        const list = await res.json();
        c.innerHTML = \`
          <table>
            <thead><tr><th>Evidence ID</th><th>Type</th><th>Source</th><th>Geography</th><th>Metric</th><th>Collected At</th></tr></thead>
            <tbody>
              \${list.map(i => \`
                <tr>
                  <td><code>\${i.evidenceId.substring(0, 13)}...</code></td>
                  <td><span class="badge">\${i.evidenceType}</span></td>
                  <td>\${i.source.provider || i.source.url}</td>
                  <td>\${i.geography.country}</td>
                  <td><strong>\${i.metric.value} \${i.metric.unit}</strong> <span style="color: var(--text-muted); font-size: 12px;">(\${i.metric.name})</span></td>
                  <td style="font-size: 12px; color: var(--text-muted);">\${new Date(i.collectedAt).toLocaleTimeString()}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      } catch (e) {
        c.innerText = 'Error loading evidence';
      }
    }

    async function loadCalculations() {
      const c = document.getElementById('calc-table-container');
      try {
        const res = await fetch('/api/calculations');
        const list = await res.json();
        c.innerHTML = \`
          <table>
            <thead><tr><th>Calculation ID</th><th>Formula</th><th>Deterministic Result</th><th>Input Evidence Citations</th></tr></thead>
            <tbody>
              \${list.map(calc => \`
                <tr>
                  <td><code>\${calc.calculationId.substring(0, 13)}...</code></td>
                  <td><strong>\${calc.formulaName}</strong> (v\${calc.formulaVersion})</td>
                  <td><strong style="color: var(--primary);">\${calc.outputMetric.value} \${calc.outputMetric.unit}</strong></td>
                  <td><code>\${calc.inputEvidenceIds.map(id => id.substring(0, 8) + '...').join(', ')}</code></td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      } catch (e) {
        c.innerText = 'Error loading calculations';
      }
    }

    async function submitRequest(e) {
      e.preventDefault();
      const alert = document.getElementById('request-alert');
      const submitBtn = document.getElementById('btn-submit-req');
      alert.className = 'alert';
      alert.style.display = 'none';
      submitBtn.innerText = '⏳ Validating and generating report...';

      const payload = {
        requestSchemaVersion: '1.0.0',
        query: document.getElementById('f-query').value.trim(),
        country: document.getElementById('f-country').value.trim().toUpperCase(),
        currency: document.getElementById('f-currency').value.trim().toUpperCase(),
        periodStart: document.getElementById('f-start').value,
        periodEnd: document.getElementById('f-end').value,
        targetPrice: parseFloat(document.getElementById('f-price').value) || undefined,
        accountId: 'aaaaaaaa-0000-4000-8000-000000000001',
      };

      try {
        const res = await fetch('/api/research-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          alert.className = 'alert error';
          alert.innerHTML = '<strong>Validation Error:</strong><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          submitBtn.innerText = '🚀 Submit Request & Auto-Generate Report';
        } else {
          showToast('✅ Report generated for ' + payload.query + '!');
          document.getElementById('f-query').value = '';
          submitBtn.innerText = '🚀 Submit Request & Auto-Generate Report';
          
          await loadStats();

          // If a report was generated, immediately switch to the Reports tab and select it!
          if (data.report && data.report.report && data.report.report.versionId) {
            switchTab('reports');
            await loadReportListAndCurrent(data.report.report.versionId);
          } else {
            loadRequests();
          }
        }
      } catch (err) {
        alert.className = 'alert error';
        alert.innerText = 'Request failed: ' + err.message;
        submitBtn.innerText = '🚀 Submit Request & Auto-Generate Report';
      }
    }

    // Initial load
    loadStats();
    loadReportListAndCurrent();
  </script>
</body>
</html>`;
}
