#!/bin/bash
set -e

echo "=== Generating HTML report with embedded screenshots ==="

if [ ! -f "results/merged-report.json" ]; then
    echo "❌ No merged JSON found, cannot generate consolidated report"
    exit 1
fi

echo "Generating comprehensive HTML report from merged JSON..."
npm run report:generate

if [ ! -f "results/html/merged-report.html" ]; then
    echo "❌ HTML generation failed"
    exit 1
fi

echo "✅ Consolidated HTML report generated successfully"
echo "Report size: $(wc -c < results/html/merged-report.html) bytes"

npm run report:copy-screenshots

echo "=== Final consolidated report ready ==="
ls -la results/html/
