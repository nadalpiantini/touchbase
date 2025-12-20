import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers/auth';

test.describe('Login Fix Testing', () => {
  test('test login with real credentials', async ({ page }) => {
    // Enable console logging only in debug mode
    const DEBUG = process.env.DEBUG_TESTS === 'true';
    
    if (DEBUG) {
      page.on('console', msg => {
        // Only log errors in production tests
        if (msg.type() === 'error') {
          console.error(`[CONSOLE ${msg.type()}]:`, msg.text());
        }
      });

      // Log network requests only in debug mode
      page.on('request', request => {
        if (request.url().includes('supabase') || request.url().includes('auth')) {
          console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
        }
      });

      // Log network responses only in debug mode
      page.on('response', response => {
        if (response.url().includes('supabase') || response.url().includes('auth')) {
          console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
          if (response.status() >= 400) {
            response.text().then(text => {
              console.log(`[ERROR BODY]:`, text);
            }).catch(() => {});
          }
        }
      });
    }

    // Go to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot before
    await page.screenshot({ path: 'test-results/login-before.png', fullPage: true });

    // Check if form exists
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeVisible({ timeout: 5000 });

    // Fill form with test credentials from environment
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);

    // Click submit
    await submitButton.click();

    // Wait and check what happens
    await page.waitForTimeout(2000);

    // Check for errors
    const errorDiv = page.locator('.bg-red-50, .text-red-800, [class*="error"]');
    const errorCount = await errorDiv.count();
    
    if (errorCount > 0) {
      const errorText = await errorDiv.first().textContent();
      if (DEBUG) {
        console.log('[ERROR FOUND]:', errorText);
      }
      await page.screenshot({ path: 'test-results/login-error.png', fullPage: true });
      throw new Error(`Login failed: ${errorText}`);
    }

    // Check if redirected
    const currentUrl = page.url();
    if (DEBUG) {
      console.log('[CURRENT URL]:', currentUrl);
    }

    // Wait a bit more to see if redirect happens
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    if (DEBUG) {
      console.log('[FINAL URL]:', finalUrl);
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/login-after.png', fullPage: true });

    // Check if we're on dashboard or still on login
    if (finalUrl.includes('/login')) {
      if (DEBUG) {
        console.log('[FAILED]: Still on login page');
        const bodyText = await page.textContent('body');
        console.log('[BODY TEXT]:', bodyText?.substring(0, 500));
      }
      throw new Error('Login failed: Still on login page');
    } else if (finalUrl.includes('/dashboard')) {
      if (DEBUG) {
        console.log('[SUCCESS]: Redirected to dashboard');
      }
      // Test passed
      expect(finalUrl).toContain('/dashboard');
    }
  });
});

