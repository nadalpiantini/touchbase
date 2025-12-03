import { Page } from '@playwright/test';

// Test user credentials - make sure these exist in your Supabase test environment
export const TEST_USER = {
  email: 'nadalpiantini@gmail.com',
  password: 'Teclados#13',
  invalidPassword: 'WrongPassword123'
};

export const NEW_USER = {
  email: `test.${Date.now()}@touchbase.com`,
  password: 'NewUser123!',
  confirmPassword: 'NewUser123!'
};

/**
 * Helper function to login a user
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

/**
 * Helper function to signup a new user
 */
export async function signupUser(page: Page, email: string, password: string, confirmPassword: string) {
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', confirmPassword);
  await page.click('button[type="submit"]');
}

/**
 * Helper function to logout
 */
export async function logoutUser(page: Page) {
  await page.click('button:has-text("Cerrar sesión")');
  await page.waitForURL('/login');
}

/**
 * Helper to check if user is on dashboard
 */
export async function verifyDashboardAccess(page: Page) {
  // Wait for dashboard to load
  await page.waitForURL('**/dashboard');

  // Verify key dashboard elements are present
  const dashboardTitle = page.locator('h1:has-text("Dashboard")');
  await dashboardTitle.waitFor({ state: 'visible' });

  return true;
}

/**
 * Helper to verify error message
 */
export async function verifyErrorMessage(page: Page, expectedMessage: string) {
  const errorElement = page.locator('.bg-red-50 .text-red-800');
  await errorElement.waitFor({ state: 'visible' });
  const errorText = await errorElement.textContent();
  return errorText?.includes(expectedMessage);
}

/**
 * Helper to verify success message
 */
export async function verifySuccessMessage(page: Page, expectedMessage: string) {
  const successElement = page.locator('.bg-green-50');
  await successElement.waitFor({ state: 'visible' });
  const successText = await successElement.textContent();
  return successText?.includes(expectedMessage);
}