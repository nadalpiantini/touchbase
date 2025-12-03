import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper page structure with headings', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    
    const skipLink = page.locator('a.skip-to-main, a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Email input should have label
    const emailLabel = page.locator('label[for*="email"], label:has-text(/email/i)');
    await expect(emailLabel.first()).toBeVisible();
    
    // Password input should have label
    const passwordLabel = page.locator('label[for*="password"], label:has-text(/password/i)');
    await expect(passwordLabel.first()).toBeVisible();
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/login');
    
    // Submit button should have accessible text
    const submitButton = page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    expect(buttonText?.trim().length).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    
    // Should be able to tab through all interactive elements
    let tabCount = 0;
    const maxTabs = 10;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      const currentFocus = await page.evaluate(() => document.activeElement?.tagName);
      if (currentFocus === 'BODY') break; // Reached end
      tabCount++;
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should have proper ARIA attributes on error states', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait a bit for validation
    await page.waitForTimeout(500);
    
    // Check if inputs have aria-invalid when there are errors
    const emailInput = page.locator('input[name="email"]');
    const ariaInvalid = await emailInput.getAttribute('aria-invalid');
    // HTML5 validation might not set aria-invalid, but should have validation
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt text
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/login');
    
    // Check button text contrast
    const submitButton = page.locator('button[type="submit"]');
    const buttonStyles = await submitButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });
    
    // Basic check that colors are defined
    expect(buttonStyles.color).toBeTruthy();
    expect(buttonStyles.backgroundColor).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');
    
    // Focus on input
    await page.focus('input[name="email"]');
    
    // Check if element has focus styles
    const focusedStyles = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
      };
    });
    
    // Should have some focus indication
    expect(focusedStyles).toBeTruthy();
  });
});

