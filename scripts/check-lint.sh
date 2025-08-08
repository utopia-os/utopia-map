#!/bin/bash

# Claude Code Hook: Pre-PR Lint Check
# This script runs linting checks on both app and lib before PR operations

set -e  # Exit on any error

echo "🔍 Running lint checks before PR operation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

LINT_FAILED=0

# Check if we're in the utopia-map directory
if [[ ! -f "tsconfig.base.json" ]]; then
    echo -e "${RED}❌ Error: Must be run from utopia-map root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking app linting...${NC}"
cd app
if npm run test:lint:eslint; then
    echo -e "${GREEN}✅ App linting passed${NC}"
else
    echo -e "${RED}❌ App linting failed${NC}"
    LINT_FAILED=1
fi
cd ..

echo -e "${YELLOW}📋 Checking lib linting...${NC}"
cd lib
if npm run test:lint:eslint; then
    echo -e "${GREEN}✅ Lib linting passed${NC}"
else
    echo -e "${RED}❌ Lib linting failed${NC}"
    LINT_FAILED=1
fi
cd ..

if [[ $LINT_FAILED -eq 1 ]]; then
    echo -e "${RED}❌ Lint checks failed. Please fix linting errors before creating/updating PR.${NC}"
    echo -e "${YELLOW}💡 Tip: Run 'npm run lintfix' in the failing directory to auto-fix some issues.${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 All lint checks passed! Ready for PR operation.${NC}"
fi