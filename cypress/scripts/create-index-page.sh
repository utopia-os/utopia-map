#!/bin/bash
set -e

echo "=== Creating index page for consolidated report ==="

cat > results/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Utopia Map E2E Test Report</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
    .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px #00000020; }
    .report-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px #00000020; }
    .report-link { display: block; padding: 16px 20px; margin: 12px 0; background: #e3f2fd; border-radius: 8px; text-decoration: none; color: #1976d2; border-left: 4px solid #2196f3; font-size: 18px; font-weight: 500; }
    .report-link:hover { background: #bbdefb; }
    .meta { color: #666; font-size: 14px; margin: 4px 0; }
    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status.failed { background: #ffebee; color: #c62828; }
    .status.passed { background: #e8f5e8; color: #2e7d32; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Utopia Map E2E Test Report</h1>
    <div class="meta">Generated: $(date)</div>
    <div class="meta">Run ID: ${GITHUB_RUN_ID:-unknown}</div>
    <div class="meta">Commit: ${GITHUB_SHA:-unknown}</div>
    <div class="meta">Status: <span class="status failed">Tests Failed</span></div>
  </div>

  <div class="report-section">
    <h2>📊 Consolidated Test Report</h2>
    <p>This report contains all test results from the parallel test execution, merged into one comprehensive view with screenshots embedded directly in failing test cases.</p>
    <a href="merged-report.html" class="report-link">
      📈 View Complete Test Report (All Specs)
    </a>
  </div>

  <div class="report-section">
    <h2>📸 Test Screenshots</h2>
    <p>Screenshots are automatically embedded within their respective failing test cases in the main report. No separate screenshot viewing required.</p>
  </div>

  <script>
    setTimeout(() => {
      window.location.href = 'merged-report.html';
    }, 3000);

    let countdown = 3;
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #2196f3; color: white; padding: 10px 15px; border-radius: 4px; font-size: 14px;';
    countdownEl.textContent = `Auto-redirecting in ${countdown}s...`;
    document.body.appendChild(countdownEl);

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownEl.textContent = `Auto-redirecting in ${countdown}s...`;
      } else {
        clearInterval(timer);
        countdownEl.textContent = 'Redirecting...';
      }
    }, 1000);
  </script>
</body>
</html>
EOF

echo "✅ Simple index page created with auto-redirect to consolidated report"
