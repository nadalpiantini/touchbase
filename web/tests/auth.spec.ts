import { test, expect } from '@playwright/test';
import {
  loginUser,
  signupUser,
  logoutUser,
  verifyDashboardAccess,
  verifyErrorMessage,
  verifySuccessMessage,
  TEST_USER,
  NEW_USER
} from './helpers/auth';

test.describe('Authentication Flow', () => {

  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');

      // Verify login page loaded
      await expect(page).toHaveTitle(/TouchBase/);
      await expect(page.locator('h2')).toContainText('TouchBase Login');

      // Fill in login form
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL('**/(protected)/dashboard');

      // Verify dashboard loaded
      const dashboardHeader = page.locator('h1').first();
      await expect(dashboardHeader).toBeVisible();
      await expect(dashboardHeader).toContainText('Dashboard');

      // Verify user email is displayed
      await expect(page.locator('text=' + TEST_USER.email)).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await loginUser(page, TEST_USER.email, TEST_USER.invalidPassword);

      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);

      // Should show error message
      const errorMessage = await verifyErrorMessage(page, 'Invalid login credentials');
      expect(errorMessage).toBeTruthy();
    });

    test('should show error with empty fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit with empty fields
      await page.click('button[type="submit"]');

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    test('should navigate to signup page from login', async ({ page }) => {
      await page.goto('/login');

      // Click on signup link
      await page.click('a:has-text("Crea una cuenta")');

      // Should navigate to signup page
      await expect(page).toHaveURL(/\/signup/);
      await expect(page.locator('h2')).toContainText('Crear cuenta en TouchBase');
    });
  });

  test.describe('Signup', () => {
    test('should successfully create a new account', async ({ page }) => {
      // Generate unique email for this test
      const uniqueEmail = `test.${Date.now()}@touchbase.com`;

      await page.goto('/signup');

      // Fill signup form
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', NEW_USER.password);
      await page.fill('input[name="confirmPassword"]', NEW_USER.confirmPassword);

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      const successMessage = await verifySuccessMessage(page, 'Cuenta creada exitosamente');
      expect(successMessage).toBeTruthy();

      // Should redirect to dashboard after delay
      await page.waitForURL('**/(protected)/dashboard', { timeout: 5000 });

      // Verify dashboard loaded
      await expect(page.locator('h1').first()).toContainText('Dashboard');
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with mismatched passwords
      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="password"]', NEW_USER.password);
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error
      const errorMessage = await verifyErrorMessage(page, 'Las contraseñas no coinciden');
      expect(errorMessage).toBeTruthy();

      // Should stay on signup page
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should show error when password is too short', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with short password
      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="password"]', '12345');
      await page.fill('input[name="confirmPassword"]', '12345');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error
      const errorMessage = await verifyErrorMessage(page, 'La contraseña debe tener al menos 6 caracteres');
      expect(errorMessage).toBeTruthy();
    });

    test('should navigate to login page from signup', async ({ page }) => {
      await page.goto('/signup');

      // Click on login link
      await page.click('a:has-text("¿Ya tienes cuenta? Entra aquí")');

      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h2')).toContainText('TouchBase Login');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/(protected)/dashboard');

      // Should redirect to login
      await page.waitForURL(/\/login/);
      await expect(page.locator('h2')).toContainText('TouchBase Login');
    });

    test('should allow access to dashboard after login', async ({ page }) => {
      // First login
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Should be able to access dashboard
      await page.waitForURL('**/(protected)/dashboard');
      await expect(page.locator('h1').first()).toContainText('Dashboard');

      // Navigate to different protected routes
      await page.click('a:has-text("Equipos")');
      await expect(page).toHaveURL(/\/teams/);

      await page.click('a:has-text("Jugadores")');
      await expect(page).toHaveURL(/\/players/);
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout and redirect to login', async ({ page }) => {
      // First login
      await loginUser(page, TEST_USER.email, TEST_USER.password);
      await page.waitForURL('**/(protected)/dashboard');

      // Click logout button
      await page.click('button:has-text("Cerrar sesión")');

      // Should redirect to login page
      await page.waitForURL(/\/login/);
      await expect(page.locator('h2')).toContainText('TouchBase Login');

      // Try to access dashboard after logout
      await page.goto('/(protected)/dashboard');

      // Should redirect back to login
      await page.waitForURL(/\/login/);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate email format', async ({ page }) => {
      await page.goto('/login');

      // Try invalid email format
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'password123');

      // Try to submit
      await page.click('button[type="submit"]');

      // HTML5 validation should trigger
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toContain('email');
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/login');

      // Fill form
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);

      // Start submission
      const submitPromise = page.click('button[type="submit"]');

      // Check loading state
      await expect(page.locator('button[type="submit"]')).toContainText('Iniciando sesión...');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();

      await submitPromise;
    });
  });
});