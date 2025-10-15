import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');

    // Check for main elements
    await expect(page).toHaveTitle(/TouchBase/);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to teams page', async ({ page }) => {
    await page.goto('/');

    // Click on teams link
    await page.click('a[href*="/teams"]');

    // Verify we're on teams page
    await expect(page).toHaveURL(/.*teams/);
    await expect(page.locator('h1')).toContainText(/Teams/i);
  });

  test('should navigate to schedule page', async ({ page }) => {
    await page.goto('/');

    // Click on schedule link
    await page.click('a[href*="/schedule"]');

    // Verify we're on schedule page
    await expect(page).toHaveURL(/.*schedule/);
    await expect(page.locator('h1')).toContainText(/Schedule/i);
  });

  test('should navigate to roster page', async ({ page }) => {
    await page.goto('/');

    // Click on roster link
    await page.click('a[href*="/roster"]');

    // Verify we're on roster page
    await expect(page).toHaveURL(/.*roster/);
    await expect(page.locator('h1')).toContainText(/Roster/i);
  });

  test('should navigate to stats page', async ({ page }) => {
    await page.goto('/');

    // Click on stats link
    await page.click('a[href*="/stats"]');

    // Verify we're on stats page
    await expect(page).toHaveURL(/.*stats/);
    await expect(page.locator('h1')).toContainText(/Statistics/i);
  });

  test('should have responsive navigation menu', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if mobile menu button is visible
    const menuButton = page.locator('button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Check if menu opens
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Should show 404 message
    await expect(page.locator('body')).toContainText(/404|not found/i);
  });
});