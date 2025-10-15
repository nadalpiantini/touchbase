import { test, expect, Page } from '@playwright/test';

/**
 * TouchBase Complete Navigation Test Suite
 * Tests all user navigation flows and page accessibility
 */

test.describe('Complete User Navigation Tree', () => {

  // Helper to check common navigation elements
  async function checkNavigation(page: Page) {
    const nav = page.locator('nav.nav');
    await expect(nav).toBeVisible();

    // Check all navigation links are present
    const navLinks = [
      { text: /Dashboard/i, href: '/' },
      { text: /Teams/i, href: '/teams' },
      { text: /Roster/i, href: '/roster' },
      { text: /Schedule/i, href: '/schedule' },
      { text: /Attendance/i, href: '/attendance' },
      { text: /Stats|Statistics/i, href: '/stats' },
      { text: /Tournaments/i, href: '/tournaments' },
      { text: /Standings/i, href: '/standings' },
      { text: /AI Assistant|💬/i, href: '/ai/assistant' }
    ];

    for (const link of navLinks) {
      const element = nav.locator(`a:text-matches("${link.text.source}", "i")`);
      await expect(element).toBeVisible();
    }
  }

  // Helper to check page loaded correctly
  async function checkPageLoaded(page: Page, title: RegExp) {
    await expect(page.locator('h1, h2').first()).toContainText(title);
    await checkNavigation(page);
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Dashboard Navigation', async ({ page }) => {
    // Dashboard is home page
    await expect(page).toHaveURL(/\/$/);
    await checkNavigation(page);

    // Check for dashboard specific elements
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('Teams Section Navigation', async ({ page }) => {
    // Navigate to teams list
    await page.click('nav a:text("Teams")');
    await expect(page).toHaveURL(/\/teams$/);
    await checkPageLoaded(page, /Teams/i);

    // Check for team-specific actions (if authenticated)
    const createButton = page.locator('a:text("Create Team"), button:text("Add Team")');
    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page).toHaveURL(/\/teams\/create/);
      await checkPageLoaded(page, /Create|New Team/i);

      // Go back to teams
      await page.click('nav a:text("Teams")');
    }

    // Try to click on a team if available
    const teamLink = page.locator('[data-testid="team-item"], .team-card').first();
    if (await teamLink.isVisible()) {
      await teamLink.click();
      // Should be on team detail or edit page
      await expect(page).toHaveURL(/\/teams\/\d+/);
    }
  });

  test('Roster Section Navigation', async ({ page }) => {
    // Navigate to roster
    await page.click('nav a:text("Roster")');
    await expect(page).toHaveURL(/\/roster$/);
    await checkPageLoaded(page, /Roster|Players/i);

    // Check for roster management elements
    const playerList = page.locator('[data-testid="roster-list"], .roster-table, table');
    await expect(playerList).toBeVisible();
  });

  test('Schedule Section Navigation', async ({ page }) => {
    // Navigate to schedule
    await page.click('nav a:text("Schedule")');
    await expect(page).toHaveURL(/\/schedule$/);
    await checkPageLoaded(page, /Schedule|Calendar|Events/i);

    // Check for calendar or event list
    const scheduleContent = page.locator('.schedule-container, .calendar, [data-testid="schedule-list"]');
    await expect(scheduleContent).toBeVisible();
  });

  test('Attendance Section Navigation', async ({ page }) => {
    // Navigate to attendance
    await page.click('nav a:text("Attendance")');
    await expect(page).toHaveURL(/\/attendance$/);
    await checkPageLoaded(page, /Attendance/i);

    // Check for attendance tracking elements
    const attendanceContent = page.locator('[data-testid="attendance-list"], .attendance-table, table');
    await expect(attendanceContent).toBeVisible();
  });

  test('Statistics Section Navigation', async ({ page }) => {
    // Navigate to stats
    await page.click('nav a:text-matches("Stats|Statistics", "i")');
    await expect(page).toHaveURL(/\/stats$/);
    await checkPageLoaded(page, /Statistics|Stats/i);

    // Check for stats content
    const statsContent = page.locator('.stats-container, [data-testid="stats-list"], table');
    await expect(statsContent).toBeVisible();
  });

  test('Tournaments Section Navigation', async ({ page }) => {
    // Navigate to tournaments
    await page.click('nav a:text("Tournaments")');
    await expect(page).toHaveURL(/\/tournaments$/);
    await checkPageLoaded(page, /Tournaments/i);

    // Check for create tournament button (if authenticated)
    const createTournamentBtn = page.locator('a:text("Create Tournament"), button:text("New Tournament")');
    if (await createTournamentBtn.isVisible()) {
      await createTournamentBtn.click();
      await expect(page).toHaveURL(/\/tournaments\/create/);
      await checkPageLoaded(page, /Create|New Tournament/i);

      // Go back
      await page.click('nav a:text("Tournaments")');
    }

    // Try to view a tournament if available
    const tournamentLink = page.locator('[data-testid="tournament-item"], .tournament-card').first();
    if (await tournamentLink.isVisible()) {
      await tournamentLink.click();
      await expect(page).toHaveURL(/\/tournaments\/\d+/);
      await checkPageLoaded(page, /Tournament|Bracket/i);
    }
  });

  test('Standings Section Navigation', async ({ page }) => {
    // Navigate to standings
    await page.click('nav a:text("Standings")');
    await expect(page).toHaveURL(/\/standings$/);
    await checkPageLoaded(page, /Standings|Leaderboard/i);

    // Check for standings table
    const standingsTable = page.locator('.standings-table, [data-testid="standings"], table');
    await expect(standingsTable).toBeVisible();
  });

  test('AI Assistant Navigation', async ({ page }) => {
    // Navigate to AI Assistant
    await page.click('nav a:has-text("AI Assistant"), nav a:has-text("💬")');
    await expect(page).toHaveURL(/\/ai\/assistant/);
    await checkPageLoaded(page, /AI Assistant|Coach Assistant/i);

    // Check for chat interface
    const chatInterface = page.locator('.chat-container, [data-testid="ai-chat"], form');
    await expect(chatInterface).toBeVisible();
  });

  test('Language Switcher', async ({ page }) => {
    // Check language switcher is present
    const langSwitcher = page.locator('form[action*="/lang/switch"]');
    await expect(langSwitcher).toBeVisible();

    // Test switching to Spanish
    await page.click('button[name="lang"][value="es"]');
    await page.waitForLoadState('networkidle');

    // Check if some text changed to Spanish
    const navText = await page.locator('nav').textContent();
    const hasSpanish = navText?.includes('Equipos') || navText?.includes('Asistencia');

    if (hasSpanish) {
      // Switch back to English
      await page.click('button[name="lang"][value="en"]');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Analytics Navigation', async ({ page }) => {
    // Try direct navigation to analytics pages
    await page.goto('/analytics/team');
    if (page.url().includes('/analytics/team')) {
      await checkPageLoaded(page, /Analytics|Analysis/i);
    }

    await page.goto('/analytics/player');
    if (page.url().includes('/analytics/player')) {
      await checkPageLoaded(page, /Player|Analytics/i);
    }
  });

  test('Settings Navigation (Admin)', async ({ page }) => {
    // Try to access settings (may require admin)
    await page.goto('/settings');
    if (page.url().includes('/settings')) {
      await checkPageLoaded(page, /Settings|Configuration/i);

      // Check for settings form
      const settingsForm = page.locator('form[action*="/settings"]');
      await expect(settingsForm).toBeVisible();
    }
  });

  test('Parent Dashboard Navigation', async ({ page }) => {
    // Try to access parent dashboard
    await page.goto('/parent');
    if (page.url().includes('/parent')) {
      await checkPageLoaded(page, /Parent|Dashboard/i);

      // Check for parent-specific content
      const parentContent = page.locator('.parent-dashboard, [data-testid="parent-content"]');
      await expect(parentContent).toBeVisible();
    }
  });

  test('API Health Check', async ({ page }) => {
    // Test API endpoint
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('TouchBase API');
  });

  test('404 Error Handling', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');

    // Should show 404 error
    const errorMessage = page.locator('body');
    await expect(errorMessage).toContainText(/404|not found|no existe/i);
  });

  test('Mobile Navigation', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if navigation adapts for mobile
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check if mobile menu toggle exists
    const menuToggle = page.locator('button[aria-label*="menu"], .menu-toggle, .hamburger');
    if (await menuToggle.isVisible()) {
      await menuToggle.click();

      // Check if menu opens
      const mobileMenu = page.locator('.mobile-menu, nav.open');
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('Breadcrumb Navigation', async ({ page }) => {
    // Navigate to a deep page
    await page.goto('/teams');
    const firstTeam = page.locator('[data-testid="team-item"]').first();

    if (await firstTeam.isVisible()) {
      await firstTeam.click();

      // Check for breadcrumbs
      const breadcrumbs = page.locator('.breadcrumbs, nav[aria-label="breadcrumb"]');
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toContainText(/Teams/i);
      }
    }
  });

  test('Accessibility: Keyboard Navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Navigate with Enter key
    await page.keyboard.press('Enter');

    // Should have navigated somewhere
    await page.waitForLoadState('networkidle');
  });

  test('Session Persistence', async ({ page, context }) => {
    // Navigate to different pages and check if session persists
    await page.click('nav a:text("Teams")');
    await page.click('nav a:text("Roster")');
    await page.click('nav a:text("Schedule")');

    // Go back to dashboard
    await page.click('nav a:has-text("Dashboard"), nav a[href="/"]');
    await expect(page).toHaveURL(/\/$/);

    // Check if navigation state is preserved
    await checkNavigation(page);
  });
});

test.describe('Protected Routes', () => {
  test('Admin Routes Protection', async ({ page }) => {
    // Try to access admin-only routes
    const adminRoutes = [
      '/teams/create',
      '/tournaments/create',
      '/settings'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);

      // Check if redirected to login or shows error
      if (!page.url().includes(route)) {
        // Was redirected, likely due to auth
        expect(page.url()).toMatch(/login|auth|403|dashboard/);
      } else {
        // Check if form is actually accessible
        const form = page.locator('form');
        await expect(form).toBeVisible();
      }
    }
  });
});

test.describe('Navigation Performance', () => {
  test('Page Load Times', async ({ page }) => {
    const routes = [
      '/',
      '/teams',
      '/roster',
      '/schedule',
      '/standings'
    ];

    for (const route of routes) {
      const startTime = Date.now();
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`${route} loaded in ${loadTime}ms`);
    }
  });
});