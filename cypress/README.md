# End-to-End Testing for Utopia Map

This directory contains the end-to-end tests for the **Utopia Map** application. The tests are written using [Cypress](https://www.cypress.io/).

The end-to-end suite aims to validate complete user workflows of Utopia Map, including:

- [x] **Authentication**: Login functionality, form validation, session management
- [ ] **Map Interactions**: Viewing items, navigating the map, layer interactions
- [ ] **CRUD Operations**: Creating, reading, updating, and deleting items
- [ ] **User Permissions**: Role-based access control and authorization
- [ ] **Profile Templates**: Custom item display and data rendering

### Technology Stack

- **Cypress**: E2E testing framework
- **cypress-split**: Parallel test execution for faster runs in CI and locally
- **TypeScript**: Type-safe test development
- **ESLint**: Code quality and consistency


## Test Structure

```
cypress/
├── e2e/                          # Test specifications
│   └── authentification/         # Authentication tests
│       ├── login.cy.ts           # Login workflow tests
│       └── login.form-elements.cy.ts  # Login form validation tests
├── reports/                      # Test artifacts (generated)
│   ├── screenshots/              # Failure screenshots
├── cypress.config.ts             # Cypress configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── eslint.config.mjs             # ESLint configuration
```

## GitHub CI Integration

### How E2E Tests Run in GitHub Actions

The E2E tests are automatically executed on every push via the **`test:e2e`** workflow (`.github/workflows/test.e2e.yml`).

#### Workflow Steps

1. **Checkout Code**: Retrieves the latest code from the repository
2. **Setup Node.js**: Installs Node.js version specified in `.tool-versions`
3. **Build Library**: Compiles the `utopia-ui` component library
   ```bash
   cd lib && npm install && npm run build
   ```
4. **Build Frontend**: Prepares the React application
   ```bash
   cd app
   cp .env.dist .env
   sed -i '/VITE_DIRECTUS_ADMIN_ROLE=/c\VITE_DIRECTUS_ADMIN_ROLE=8141dee8-8e10-48d0-baf1-680aea271298' .env
   npm ci && npm run build
   ```
5. **Start Docker Services**: Launches the full application stack
   ```bash
   docker compose up -d
   ```
   This starts:
   - **Frontend** (port 8080): Static file server with built app
   - **Backend** (port 8055): Directus CMS API
   - **Database**: PostgreSQL with PostGIS
   - **Cache**: Redis

6. **Wait for Directus**: Health check to ensure backend is ready
   ```bash
   timeout 120 bash -c 'until curl -f http://localhost:8055/server/health; do sleep 5; done'
   ```

7. **Seed Backend**: Populates database with test data
   ```bash
   mkdir -p ./data/uploads
   sudo chmod 777 -R ./data
   cd backend && ./seed.sh
   ```

8. **Health Checks**: Verifies both frontend and backend are accessible
   ```bash
   curl -f http://localhost:8080/login
   curl -f http://localhost:8055/server/health
   ```

9. **Install Cypress**: Installs test dependencies
   ```bash
   cd cypress && npm ci
   ```

10. **Run Tests**: Executes tests in parallel using `cypress-split`
    ```bash
    npm run test:split:auto
    ```

11. **Upload Artifacts**: On failure, uploads screenshots and videos for debugging

#### Parallel Test Execution

The CI uses [cypress-split](https://github.com/bahmutov/cypress-split) to run tests in parallel, automatically distributing spec files across multiple processes:

```bash
SPEC_COUNT=$(find e2e -name '*.cy.ts' | wc -l)
for i in $(seq 0 $((SPEC_COUNT-1))); do
  SPLIT=$SPEC_COUNT SPLIT_INDEX=$i cypress run --e2e --browser chromium &
done
wait
```

This significantly reduces total test execution time.


## Running Tests Locally (Headless Mode)

Run tests in headless mode (no GUI) to replicate the CI environment exactly.

### Prerequisites

- **Node.js**: Specified in `.tool-versions`
- **Docker & Docker Compose**: For running the application stack
- **Sufficient Disk Space**: ~2GB for Docker images and database

### Step-by-Step Instructions

#### 1. Set Node.js Version

```bash
# Use the Node.js version specified in .tool-versions
nvm use
```

This ensures you're using the correct Node.js version set in `.tool-versions`.

> **Note**: If you don't have `nvm` installed, you can install it from [nvm-sh/nvm](https://github.com/nvm-sh/nvm).

#### 2. Build the Component Library

```bash
cd lib
npm install
npm run build
cd ..
```

#### 3. Build the Frontend Application

```bash
cd app
cp .env.dist .env
# Set the admin role ID (required for proper permissions)
sed -i '/VITE_DIRECTUS_ADMIN_ROLE=/c\VITE_DIRECTUS_ADMIN_ROLE=8141dee8-8e10-48d0-baf1-680aea271298' .env
npm ci
npm run build
cd ..
```

> **Note for macOS/BSD users**: The `sed -i` command syntax differs. Use:
> ```bash
> sed -i '' '/VITE_DIRECTUS_ADMIN_ROLE=/c\
> VITE_DIRECTUS_ADMIN_ROLE=8141dee8-8e10-48d0-baf1-680aea271298' .env
>
```

#### 4. Start Docker Services

```bash
# From the repository root
docker compose up -d
```

This starts all required services in the background.

#### 5. Wait for Services to be Ready

```bash
# Wait for Directus backend to be healthy
echo "Waiting for Directus API..."
timeout 120 bash -c 'until curl -f http://localhost:8055/server/health; do echo "Waiting..."; sleep 5; done'
echo "Directus is ready!"
```

#### 6. Seed the Backend Database

```bash
# Create uploads directory and set permissions
mkdir -p ./data/uploads
sudo chmod 777 -R ./data

# Run the seeding script
cd backend
./seed.sh
cd ..
```

The seed script:
- Syncs Directus collections and schema
- Populates test data (users, items, layers, etc.)
- Executes custom SQL migrations

#### 7. Verify Services are Running

```bash
# Check frontend
curl -f http://localhost:8080/login

# Check backend
curl -f http://localhost:8055/server/health
```

Both should return HTTP 200 responses.

#### 8. Install Cypress Dependencies

```bash
cd cypress
npm ci
```

#### 9. Run the Tests

**Option A: Run all tests sequentially**
```bash
npm run test
```

**Option B: Run tests in parallel (faster, like CI)**
```bash
npm run test:split:auto
```

**Option C: Run specific test file**
```bash
npx cypress run --e2e --browser chromium --spec "e2e/authentification/login.cy.ts"
```

### Viewing Test Results

- **Console Output**: Real-time test results in the terminal
- **Screenshots**: `cypress/reports/screenshots/` (on failure)
- **Videos**: `cypress/reports/videos/` (if enabled in config)

### Cleaning Up

```bash
# Stop and remove containers
docker compose down

# Remove database data (for fresh start)
sudo rm -rf ./data/database

# Remove all data
sudo rm -rf ./data
```

## Running Tests Locally (GUI Mode)

The Cypress GUI provides an interactive test runner with time-travel debugging, live reloading, and visual feedback.

### Prerequisites

Same as headless mode (see above).

### Step-by-Step Instructions

#### 1-7. Prepare the Application

Follow steps 1-7 from the [Headless Mode](#running-tests-locally-headless-mode) section to:
- Set the correct Node.js version
- Build the library and frontend
- Start Docker services
- Seed the backend database
- Verify services are running

#### 8. Install Cypress Dependencies

```bash
cd cypress
npm ci
```

#### 9. Open Cypress GUI

```bash
npm run test:open
```

This launches the Cypress Test Runner interface.

#### 10. Using the Cypress GUI

1. **Select Browser**: Choose Chrome, Edge, Electron, or Firefox
2. **Select Test Type**: Click "E2E Testing"
3. **Choose Spec**: Click on any test file to run it
4. **Watch Execution**: See tests run in real-time with visual feedback
5. **Debug Failures**:
   - Click on test steps to see snapshots
   - Use browser DevTools for debugging
   - Hover over commands to see before/after states

### GUI Mode Features

- **Live Reload**: Tests automatically re-run when you save changes
- **Time Travel**: Click on commands to see DOM snapshots
- **Selector Playground**: Interactive tool to find element selectors
- **Network Inspection**: View all XHR/fetch requests
- **Console Logs**: See application and test logs
- **Screenshots**: Automatic screenshots on failure

### Development Workflow

1. Open Cypress GUI: `npm run test:open`
2. Edit test files in your IDE
3. Save changes → tests auto-reload
4. Debug failures using time-travel and DevTools
5. Iterate until tests pass

## Configuration

### Cypress Configuration (`cypress.config.ts`)

Key settings:

```typescript
{
  baseUrl: 'http://localhost:8080',        // Frontend URL
  viewportWidth: 1280,                     // Browser width
  viewportHeight: 720,                     // Browser height

  specPattern: 'e2e/**/*.cy.ts',           // Test file pattern
  screenshotsFolder: 'reports/screenshots',
  videosFolder: 'reports/videos',
  video: false,                            // Disable video by default
  screenshotOnRunFailure: true,            // Capture failures

  defaultCommandTimeout: 10000,            // Command timeout (10s)
  pageLoadTimeout: 30000,                  // Page load timeout (30s)

  testIsolation: true,                     // Reset state between tests

  retries: {
    runMode: 2,                            // Retry failed tests in CI
    openMode: 0                            // No retries in GUI mode
  },

  env: {
    apiUrl: 'http://localhost:8055',       // Backend API URL
    validEmail: 'admin@it4c.dev',          // Test credentials
    validPassword: 'admin123'
  }
}
```

### Environment Variables

Access in tests via `Cypress.env()`:

```typescript
const email = Cypress.env('validEmail')      // 'admin@it4c.dev'
const password = Cypress.env('validPassword') // 'admin123'
const apiUrl = Cypress.env('apiUrl')         // 'http://localhost:8055'
```

### TypeScript Configuration

The `tsconfig.json` enables:
- Type checking for Cypress commands
- IntelliSense in IDEs
- Import of custom types and utilities

## Writing Tests

### Test File Structure

```typescript
/// <reference types="cypress" />

describe('Feature Name', () => {
  beforeEach(() => {
    // Reset state before each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/page-url')
  })

  it('should perform expected behavior', () => {
    // Arrange: Set up test conditions
    cy.get('[data-testid="input"]').type('value')

    // Act: Perform action
    cy.get('[data-testid="submit"]').click()

    // Assert: Verify outcome
    cy.url().should('include', '/success')
    cy.get('[data-testid="message"]').should('contain', 'Success')
  })
})
```

### Best Practices

1. **Use Data Attributes**: Prefer `[data-testid="..."]` over classes/IDs
2. **Test User Behavior**: Focus on what users do, not implementation
3. **Avoid Hard Waits**: Use `cy.wait('@alias')` or assertions instead of `cy.wait(1000)`
4. **Keep Tests Isolated**: Each test should run independently
5. **Use Custom Commands**: Extract common patterns to reusable commands
6. **Handle Async**: Cypress automatically waits for elements and requests
7. **Clear State**: Reset cookies, localStorage, and sessionStorage in `beforeEach`

### Example: Login Test

```typescript
it('should login with valid credentials', () => {
  cy.get('[data-testid="email-input"]').type(Cypress.env('validEmail'))
  cy.get('[data-testid="password-input"]').type(Cypress.env('validPassword'))
  cy.get('[data-testid="login-button"]').click()

  cy.url().should('not.include', '/login')
  cy.getCookie('directus_session_token').should('exist')
})
```

## Troubleshooting

### Common Issues

#### 1. **Tests Fail with "baseUrl not reachable"**

**Cause**: Frontend not running or not built

**Solution**:
```bash
cd app
npm run build
cd ..
docker compose up -d
```

#### 2. **Backend Health Check Fails**

**Cause**: Directus not ready or database connection issues

**Solution**:
```bash
# Check logs
docker compose logs backend

# Restart services
docker compose down
docker compose up -d

# Wait for health
curl http://localhost:8055/server/health
```

#### 3. **Seeding Fails with "ConflictError: Local id already exists"**

**Cause**: Database already contains data from previous runs

**Solution**:
```bash
# Stop containers
docker compose down

# Remove database data
sudo rm -rf ./data/database

# Restart and re-seed
docker compose up -d
# Wait for Directus to be ready
cd backend && ./seed.sh
```

#### 4. **Tests Pass Locally but Fail in CI**

**Cause**: Environment differences or timing issues

**Solution**:
- Check Node.js version matches `.tool-versions`
- Increase timeouts in `cypress.config.ts`
- Review CI logs and screenshots
- Run locally with `npm run test:split:auto` to replicate CI

#### 5. **Cypress Binary Not Found**

**Cause**: Cypress not installed properly

**Solution**:
```bash
cd cypress
rm -rf node_modules
npm ci
npx cypress install
```

#### 6. **Permission Denied on `./data` Directory**

**Cause**: Insufficient permissions for Docker volumes

**Solution**:
```bash
sudo chmod 777 -R ./data
# Or change ownership
sudo chown -R $USER:$USER ./data
```

#### 7. **Port Already in Use**

**Cause**: Another service using ports 8080 or 8055

**Solution**:
```bash
# Find process using port
lsof -i :8080
lsof -i :8055

# Kill process or stop conflicting service
docker compose down
```

#### 8. **`sed` Command Fails on macOS**

**Cause**: BSD `sed` has different syntax than GNU `sed`

**Solution**:
```bash
# Use this syntax on macOS
sed -i '' '/VITE_DIRECTUS_ADMIN_ROLE=/c\
VITE_DIRECTUS_ADMIN_ROLE=8141dee8-8e10-48d0-baf1-680aea271298' .env
```

### Debug Mode

Run Cypress with debug output:

```bash
DEBUG=cypress:* npm run test
```

### Viewing Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs database

# Follow logs
docker compose logs -f backend
```

### Getting Help

- **Cypress Documentation**: https://docs.cypress.io
- **Utopia Map Issues**: https://github.com/utopia-os/utopia-map/issues
- **Cypress Discord**: https://discord.gg/cypress

## Additional Resources

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Reference](https://docs.cypress.io/api/table-of-contents)
- [TypeScript with Cypress](https://docs.cypress.io/guides/tooling/typescript-support)
- [Debugging Cypress Tests](https://docs.cypress.io/guides/guides/debugging)
- [Directus Documentation](https://docs.directus.io/)

## Contributing

When adding new E2E tests:

1. Follow the existing test structure and naming conventions
2. Add tests to appropriate subdirectories (e.g., `e2e/authentification/`)
3. Use TypeScript for type safety
4. Run linting: `npm run lint`
5. Ensure tests pass locally before pushing
6. Update this README if adding new test categories or setup steps
