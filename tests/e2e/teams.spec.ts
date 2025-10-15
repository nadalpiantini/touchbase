import { test, expect } from '@playwright/test';

test.describe('Teams Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
  });

  test('should display teams list', async ({ page }) => {
    // Check if teams container exists
    await expect(page.locator('[data-testid="teams-list"]')).toBeVisible();

    // Check for team cards or table
    const teamItems = page.locator('[data-testid="team-item"]');
    const count = await teamItems.count();

    // Should have at least one team or show empty state
    if (count === 0) {
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should open create team modal', async ({ page }) => {
    // Click create team button
    await page.click('button:has-text("Create Team"), button:has-text("Add Team"), button:has-text("New Team")');

    // Check if modal or form appears
    await expect(page.locator('form[data-testid="team-form"], #team-form, .team-form')).toBeVisible();

    // Check for required fields
    await expect(page.locator('input[name="name"], input[name="team_name"]')).toBeVisible();
    await expect(page.locator('select[name="category"], select[name="age_category"]')).toBeVisible();
  });

  test('should create a new team', async ({ page }) => {
    // Click create team button
    await page.click('button:has-text("Create Team"), button:has-text("Add Team"), button:has-text("New Team")');

    // Fill in team details
    await page.fill('input[name="name"], input[name="team_name"]', 'Test Team U12');
    await page.selectOption('select[name="category"], select[name="age_category"]', 'U12');
    await page.fill('textarea[name="description"], textarea[name="team_description"]', 'Test team for E2E testing');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")');

    // Check for success message or redirect
    await expect(page).toHaveURL(/.*teams/);

    // Verify new team appears in list
    await expect(page.locator('text=Test Team U12')).toBeVisible();
  });

  test('should edit team details', async ({ page }) => {
    // Click on first team's edit button
    const firstTeam = page.locator('[data-testid="team-item"]').first();
    await firstTeam.locator('button:has-text("Edit"), a:has-text("Edit")').click();

    // Check if edit form appears
    await expect(page.locator('form')).toBeVisible();

    // Modify team name
    const nameInput = page.locator('input[name="name"], input[name="team_name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Team Name');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")');

    // Verify changes were saved
    await expect(page.locator('text=Updated Team Name')).toBeVisible();
  });

  test('should view team details', async ({ page }) => {
    // Click on first team to view details
    const firstTeam = page.locator('[data-testid="team-item"]').first();
    await firstTeam.locator('a, button:has-text("View")').first().click();

    // Should navigate to team detail page
    await expect(page).toHaveURL(/.*teams\/\d+/);

    // Check for team information sections
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('text=/Players|Roster/i')).toBeVisible();
  });

  test('should filter teams by category', async ({ page }) => {
    // Check if filter dropdown exists
    const filterSelect = page.locator('select[name="category_filter"], select[data-testid="category-filter"]');

    if (await filterSelect.isVisible()) {
      // Select U12 category
      await filterSelect.selectOption('U12');

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that only U12 teams are visible
      const teamItems = page.locator('[data-testid="team-item"]');
      const count = await teamItems.count();

      for (let i = 0; i < count; i++) {
        const teamText = await teamItems.nth(i).textContent();
        expect(teamText).toContain('U12');
      }
    }
  });

  test('should handle team deletion with confirmation', async ({ page }) => {
    // Click delete on first team
    const firstTeam = page.locator('[data-testid="team-item"]').first();
    const teamName = await firstTeam.locator('.team-name, h3').first().textContent();

    await firstTeam.locator('button:has-text("Delete"), button[aria-label="Delete"]').click();

    // Handle confirmation dialog
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.accept();
    });

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify team is no longer in list
    await expect(page.locator(`text="${teamName}"`)).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click create team button
    await page.click('button:has-text("Create Team"), button:has-text("Add Team"), button:has-text("New Team")');

    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")');

    // Check for validation errors
    await expect(page.locator('.error-message, .invalid-feedback, [role="alert"]')).toBeVisible();
  });
});