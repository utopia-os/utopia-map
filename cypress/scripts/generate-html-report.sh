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
    echo "Screenshots directory found"

    # Remove unwanted screenshots (like before-intentional-failure)
    echo "Cleaning up unwanted screenshots..."
    find screenshots -name "*before-intentional-failure*" -type f -delete 2>/dev/null || true
    find screenshots -name "*before-*" -type f -delete 2>/dev/null || true

    # Create screenshots directory in the HTML output
    mkdir -p "results/html/screenshots"

    # Extract all screenshot paths expected by the HTML report and copy them accordingly
    echo "Extracting screenshot paths from HTML report..."

    # Create screenshots directory in the HTML output
    mkdir -p "results/html/screenshots"

    if [ -f "results/merged-report.json" ]; then
        echo "Reading expected screenshot paths from JSON report..."

        # Extract all screenshot paths referenced in the JSON report (from context fields)
        grep -o 'screenshots/[^"]*\.png' results/merged-report.json | sort -u | while read expected_path; do
            # Extract components from expected path: screenshots/parent-dir/test-file/filename.png
            if [[ "$expected_path" =~ screenshots/([^/]+)/([^/]+)/(.+) ]]; then
                parent_dir="${BASH_REMATCH[1]}"
                test_file="${BASH_REMATCH[2]}"
                filename="${BASH_REMATCH[3]}"

                # Try to find the actual screenshot in various possible locations
                actual_screenshot=""

                # 1. Try full structure first: screenshots/parent-dir/test-file/filename.png
                if [ -f "screenshots/$parent_dir/$test_file/$filename" ]; then
                    actual_screenshot="screenshots/$parent_dir/$test_file/$filename"
                # 2. Try flat structure: screenshots/test-file/filename.png
                elif [ -f "screenshots/$test_file/$filename" ]; then
                    actual_screenshot="screenshots/$test_file/$filename"
                # 3. Try direct file: screenshots/filename.png
                elif [ -f "screenshots/$filename" ]; then
                    actual_screenshot="screenshots/$filename"
                fi

                if [ -n "$actual_screenshot" ] && [ -f "$actual_screenshot" ]; then
                    # Create the expected directory structure in results/html
                    target_path="results/html/$expected_path"
                    target_dir=$(dirname "$target_path")
                    mkdir -p "$target_dir"

                    # Copy the screenshot to the expected location
                    cp "$actual_screenshot" "$target_path"
                    echo "Mapped screenshot: $(basename "$test_file") -> $parent_dir/$test_file"
                fi
            fi
        done
    else
        echo "❌ No JSON report found, cannot determine expected screenshot paths"
        # Fallback: copy whatever structure exists
        if [ -d "screenshots" ] && [ "$(find screenshots -name '*.png' | wc -l)" -gt 0 ]; then
            echo "Fallback: copying existing screenshot structure..."
            cp -r screenshots/* results/html/screenshots/ 2>/dev/null || true
        fi
    fi

    echo "✅ Screenshots copied successfully"
    echo "Final screenshot structure:"
    find results/html/screenshots -type f -name "*.png" | head -10
else
    echo "⚠️ No screenshots directory found"
fi

echo "=== Final consolidated report ready ==="
ls -la results/html/
