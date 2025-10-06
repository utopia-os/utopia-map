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

# Copy screenshots with proper structure for the HTML report
echo "Copying screenshots to HTML report directory..."
if [ -d "screenshots" ]; then
    # Create screenshots directory in the HTML output
    mkdir -p "results/html/screenshots"

    # Copy all screenshots maintaining directory structure
    cp -r screenshots/* results/html/screenshots/ 2>/dev/null || true

    echo "✅ Screenshots copied successfully"
    echo "Screenshot structure:"
    find results/html/screenshots -type f -name "*.png" | head -5
else
    echo "⚠️ No screenshots directory found"
fi

echo "=== Final consolidated report ready ==="
ls -la results/html/
