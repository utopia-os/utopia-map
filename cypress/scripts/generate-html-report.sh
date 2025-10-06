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
echo "DEBUG: Current working directory: $(pwd)"
echo "DEBUG: Available directories:"
ls -la

if [ -d "screenshots" ]; then
    echo "DEBUG: Screenshots directory found"
    echo "DEBUG: Screenshots directory structure:"
    find screenshots -type f -name "*.png" | head -10

    # Remove unwanted screenshots (like before-intentional-failure)
    echo "Cleaning up unwanted screenshots..."
    find screenshots -name "*before-intentional-failure*" -type f -delete 2>/dev/null || true
    find screenshots -name "*before-*" -type f -delete 2>/dev/null || true

    # Create screenshots directory in the HTML output
    mkdir -p "results/html/screenshots"

    # Copy all screenshots maintaining directory structure
    cp -r screenshots/* results/html/screenshots/ 2>/dev/null || true

    echo "✅ Screenshots copied successfully"
    echo "DEBUG: Final screenshot structure in HTML output:"
    find results/html/screenshots -type f -name "*.png" | head -10

    echo "DEBUG: Full results/html structure:"
    find results/html -type f | head -20
else
    echo "⚠️ No screenshots directory found"
    echo "DEBUG: Available files and directories:"
    find . -maxdepth 2 -type d
fi

echo "=== Final consolidated report ready ==="
ls -la results/html/
