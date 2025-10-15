# TouchBase E2E Tests

This directory contains end-to-end tests for the TouchBase application using Playwright.

## Setup

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (if not already installed):
   ```bash
   npx playwright install
   ```

3. **Create a test user in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to Authentication > Users
   - Create a user with these credentials:
     - Email: `test@touchbase.com`
     - Password: `TestPassword123!`

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/auth.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should successfully login"
```

## Test Structure

```
tests/
├── auth.spec.ts          # Authentication flow tests
├── helpers/
│   └── auth.ts          # Authentication helper functions
└── README.md            # This file
```

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- **Login Flow**:
  - ✅ Successful login with valid credentials
  - ✅ Error handling for invalid credentials
  - ✅ Form validation (empty fields, email format)
  - ✅ Navigation to signup page

- **Signup Flow**:
  - ✅ Successful account creation
  - ✅ Password validation (length, matching)
  - ✅ Error handling for existing users
  - ✅ Navigation to login page

- **Protected Routes**:
  - ✅ Redirect to login when not authenticated
  - ✅ Access to dashboard after login
  - ✅ Navigation between protected pages

- **Logout**:
  - ✅ Successful logout and redirect
  - ✅ Cannot access protected routes after logout

## Common Issues and Solutions

### Issue: Tests fail with "Invalid login credentials"
**Solution**: Make sure the test user exists in your Supabase database with the correct credentials.

### Issue: Tests timeout on dashboard redirect
**Solution**: The dashboard route was fixed to `/(protected)/dashboard`. Make sure your local server is running.

### Issue: "Page closed" errors
**Solution**: This usually means the dev server isn't running. The config automatically starts it, but you can run `npm run dev` manually.

## Writing New Tests

### Use the helper functions:
```typescript
import { loginUser, verifyDashboardAccess } from './helpers/auth';

test('my new test', async ({ page }) => {
  await loginUser(page, 'test@touchbase.com', 'TestPassword123!');
  await verifyDashboardAccess(page);
  // Your test logic here
});
```

### Best Practices:
1. Use data-testid attributes for reliable element selection
2. Always wait for navigation/elements before assertions
3. Use meaningful test descriptions
4. Group related tests with describe blocks
5. Clean up test data after tests (if creating new records)

## CI/CD Integration

To run tests in CI, set the `CI` environment variable:
```bash
CI=true npm run test:e2e
```

This will:
- Run tests in headless mode
- Enable retries (2 attempts)
- Use a single worker
- Fail if `test.only` is found in code

## Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

The report includes:
- Test results
- Screenshots on failure
- Traces for debugging
- Timing information