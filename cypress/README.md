# Cypress End-to-End Tests

This directory contains **end-to-end tests** for the **Utopia Map application** using [Cypress](https://www.cypress.io/).

## Technology Stack

- **Cypress** - E2E testing framework with TypeScript
- **cypress-split** - Parallel test execution for faster runs - in the CI pipeline and locally
- **mochawesome** - HTML report generation with embedded screenshots for the Github CI pipeline

## GitHub CI Integration

Tests run automatically on every push via the `.github/workflows/test.e2e.yml` workflow:

1. **Build** - Compiles the library and frontend application
2. **Start Services** - Launches Docker stack (frontend, backend, database)
3. **Seed Data** - Populates database with test data
4. **Run Tests** - Executes tests in parallel using `cypress-split`
5. **Generate Reports** - Creates consolidated HTML report with screenshots
6. **Upload Artifacts** - On failure, uploads test reports for debugging

### Parallel Execution

Tests run in parallel using [cypress-split](https://github.com/bahmutov/cypress-split), automatically distributing spec files across multiple processes to reduce execution time.

### Test Reports

When tests fail, GitHub Actions automatically uploads as artefact:
- **HTML Report**
  - Interactive test results with embedded screenshots
  - Available for 14 days with unique naming: `e2e-test-report-{run-id}`

## Running Tests Locally

### Prerequisites

- Node.js (version from `.tool-versions`)
- Docker and Docker Compose
- Sufficient disk space (~2GB for Docker images)

### Headless Mode (CI-like)

Run tests without GUI, replicating the CI environment:

```bash
# 1. Set Node.js version
nvm use

# 2. Build the library and frontend
cd lib && npm install && npm run build && cd ..

# 3.Build the frontend && cd ..
cd app && cp .env.dist .env
sed -i '/VITE_DIRECTUS_ADMIN_ROLE=/c\VITE_DIRECTUS_ADMIN_ROLE=8141dee8-8e10-48d0-baf1-680aea271298' .env
npm ci && npm run build && cd ..

# 3. Start Docker services
docker compose up -d

# 4. Wait for services and seed data
timeout 120 bash -c 'until curl -f http://localhost:8055/server/health; do sleep 5; done'
cd backend && ./seed.sh && cd ..

# 5. Run tests
cd cypress && npm ci

# Run all tests in parallel (like CI)
npm run test:split:auto

# Or run tests sequentially
npm test

# Or run specific test file
npx cypress run --e2e --browser chromium --spec "e2e/authentication/login.cy.ts"
```

### GUI Mode (Development)

Run tests with interactive GUI for debugging:

```bash
# 1-4. Follow steps 1-4 from headless mode above

# 5. Open Cypress GUI
cd cypress && npm ci && npm run test:open
```

#### GUI Features

- **Live Reload** - Tests auto-reload when you save changes
- **Time Travel** - Click commands to see DOM snapshots
- **Selector Playground** - Interactive tool to find element selectors
- **Network Inspection** - View all XHR/fetch requests
- **Debug Tools** - Use browser DevTools for debugging

### Cleanup

```bash
# Stop containers
docker compose down

# Remove database data (for fresh start)
sudo rm -rf ./data/database
```

## Test Reports

After running tests, reports are generated in `cypress/results/`:

- **HTML Report** - `results/html/merged-report.html` - Interactive report with charts
- **Screenshots** - `results/html/screenshots/` - Failure screenshots embedded in HTML
- **JSON Data** - `results/*.json` - Raw test data for custom processing

Generate reports manually:
```bash
npm run report:merge      # Merge parallel test results
npm run report:generate   # Create HTML report
```

## Writing Tests

Tests are located in `cypress/e2e/` and follow this structure:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/page-url')
  })

  it('should perform expected behavior', () => {
    cy.get('[data-cy="input"]').type('value')
    cy.get('[data-cy="submit"]').click()
    cy.url().should('include', '/success')
  })
})
```

### Best Practices

- Use `[data-cy="..."]` selectors for stability
- Test user behavior, rather than just implementation details
- Keep tests isolated and independent
- Use custom commands for common patterns
- Clear state in `beforeEach` hooks

## Troubleshooting

**Tests fail with "baseUrl not reachable"**
```bash
cd app && npm run build && cd .. && docker compose up -d
```

**Backend health check fails**
```bash
docker compose logs backend
docker compose down && docker compose up -d
```

**Seeding fails with "ConflictError"**
```bash
docker compose down && sudo rm -rf ./data/database && docker compose up -d
```

**Permission denied on ./data**
```bash
sudo chmod 777 -R ./data
```
