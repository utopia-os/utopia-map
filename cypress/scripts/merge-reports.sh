#!/bin/bash
set -e

echo "=== Merging all JSON reports into one consolidated report ==="

json_count=$(find results/ -name "*.json" -type f 2>/dev/null | wc -l)
echo "Found $json_count JSON report files from parallel test execution"

if [ "$json_count" -gt 0 ]; then
    echo "=== JSON files found ==="
    find results/ -name "*.json" -type f | sort
    
    echo "=== Merging all reports into one ==="
    npm run report:merge
    
    if [ ! -f "results/merged-report.json" ]; then
        echo "❌ Merge failed - no merged-report.json created"
        exit 1
    fi
    
    echo "✅ Successfully merged $json_count JSON reports into one"
    echo "Merged report size: $(wc -c < results/merged-report.json) bytes"
    
    report=$(cat results/merged-report.json)
    echo "Consolidated report stats:"
    echo "   - Total tests: $(echo "$report" | node -pe 'JSON.parse(require("fs").readFileSync(0)).stats?.tests || 0')"
    echo "   - Passed: $(echo "$report" | node -pe 'JSON.parse(require("fs").readFileSync(0)).stats?.passes || 0')"
    echo "   - Failed: $(echo "$report" | node -pe 'JSON.parse(require("fs").readFileSync(0)).stats?.failures || 0')"
    echo "   - Duration: $(echo "$report" | node -pe 'JSON.parse(require("fs").readFileSync(0)).stats?.duration || 0')ms"
else
    echo "❌ No JSON reports found to merge"
    echo "Creating empty report structure..."
    mkdir -p results
    echo '{"stats":{"tests":0,"passes":0,"failures":0},"results":[]}' > results/merged-report.json
fi
