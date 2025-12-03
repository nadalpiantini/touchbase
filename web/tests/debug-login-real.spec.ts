import { test, expect } from '@playwright/test';

test('debug login real', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'log') {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    }
  });

  // Log all network requests
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('auth')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  // Log all network responses
  page.on('response', async response => {
    if (response.url().includes('supabase') || response.url().includes('auth')) {
      const status = response.status();
      const url = response.url();
      console.log(`[RESPONSE] ${status} ${url}`);
      
      if (status >= 400) {
        try {
          const body = await response.text();
          console.log(`[ERROR BODY]:`, body.substring(0, 500));
        } catch (e) {
          console.log(`[ERROR]: Could not read error body`);
        }
      }
    }
  });

  // Go to login
  console.log('[TEST] Navigating to login...');
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: 'test-results/login-initial.png', fullPage: true });

  // Check if form exists
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await expect(emailInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await expect(submitButton).toBeVisible({ timeout: 5000 });

  console.log('[TEST] Form found, filling credentials...');
  
  // Fill with test credentials
  await emailInput.fill('nadalpiantini@gmail.com');
  await passwordInput.fill('Teclados#13');

  console.log('[TEST] Submitting form...');
  await submitButton.click();

  // Wait and observe
  await page.waitForTimeout(3000);

  // Check current URL
  const currentUrl = page.url();
  console.log(`[TEST] Current URL after submit: ${currentUrl}`);

  // Check for errors
  const errorDiv = page.locator('.bg-red-50, .text-red-800, [class*="error"]');
  const errorCount = await errorDiv.count();
  
  if (errorCount > 0) {
    const errorText = await errorDiv.first().textContent();
    console.log(`[ERROR FOUND]: ${errorText}`);
    await page.screenshot({ path: 'test-results/login-error.png', fullPage: true });
  }

  // Check if still on login or redirected
  if (currentUrl.includes('/login')) {
    console.log('[RESULT] Still on login page - LOGIN FAILED');
    
    // Get page content to see what's there
    const bodyText = await page.textContent('body');
    console.log('[PAGE CONTENT]:', bodyText?.substring(0, 1000));
    
    // Check for any error messages in the DOM
    const allErrors = await page.locator('*').filter({ hasText: /error|Error|ERROR/i }).all();
    for (const err of allErrors) {
      const text = await err.textContent();
      console.log('[ERROR ELEMENT]:', text);
    }
  } else if (currentUrl.includes('/dashboard')) {
    console.log('[RESULT] Redirected to dashboard - LOGIN SUCCESS');
    await page.screenshot({ path: 'test-results/login-success.png', fullPage: true });
  } else {
    console.log(`[RESULT] Unexpected URL: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/login-unexpected.png', fullPage: true });
  }

  // Wait a bit more to see if anything changes
  await page.waitForTimeout(2000);
  const finalUrl = page.url();
  console.log(`[TEST] Final URL: ${finalUrl}`);
});

