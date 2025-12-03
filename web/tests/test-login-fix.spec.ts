import { test, expect } from '@playwright/test';

test.describe('Login Fix Testing', () => {
  test('test login with real credentials', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
    });

    // Log network requests
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('auth')) {
        console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
      }
    });

    // Log network responses
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

    // Fill form with test credentials
    await emailInput.fill('nadalpiantini@gmail.com');
    await passwordInput.fill('Teclados#13');

    // Click submit
    await submitButton.click();

    // Wait and check what happens
    await page.waitForTimeout(2000);

    // Check for errors
    const errorDiv = page.locator('.bg-red-50, .text-red-800, [class*="error"]');
    const errorCount = await errorDiv.count();
    
    if (errorCount > 0) {
      const errorText = await errorDiv.first().textContent();
      console.log('[ERROR FOUND]:', errorText);
      await page.screenshot({ path: 'test-results/login-error.png', fullPage: true });
    }

    // Check if redirected
    const currentUrl = page.url();
    console.log('[CURRENT URL]:', currentUrl);

    // Wait a bit more to see if redirect happens
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log('[FINAL URL]:', finalUrl);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/login-after.png', fullPage: true });

    // Check if we're on dashboard or still on login
    if (finalUrl.includes('/login')) {
      console.log('[FAILED]: Still on login page');
      // Check for any error messages
      const bodyText = await page.textContent('body');
      console.log('[BODY TEXT]:', bodyText?.substring(0, 500));
    } else if (finalUrl.includes('/dashboard')) {
      console.log('[SUCCESS]: Redirected to dashboard');
    }
  });
});

