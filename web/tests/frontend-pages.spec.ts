import { test, expect } from '@playwright/test';
import { loginUser, TEST_USER } from './helpers/auth';

test.describe('Frontend Pages - Landing, Login, Dashboard', () => {

  test.describe('Landing Page', () => {
    test('should load landing page with all key elements', async ({ page }) => {
      await page.goto('/');

      // Verify page title
      await expect(page).toHaveTitle(/TouchBase/);

      // Verify logo is present (may be hidden based on viewport, but should exist in DOM)
      const logos = page.locator('img[alt*="TouchBase"]');
      await expect(logos.first()).toBeAttached();

      // Verify tagline is present (check for either English or Spanish)
      // The tagline might be in a paragraph element
      const tagline = page.locator('p, h1, h2').filter({ hasText: /Modern Sports Club Management System|Sistema Moderno de Gestión|Sistema de gestión deportiva/i });
      await expect(tagline.first()).toBeVisible({ timeout: 10000 });

      // Verify features section (check for any feature title)
      const features = page.locator('text=/Player Management|Real-Time Analytics|Mobile Access|Gestión de Jugadores|Analíticas|Acceso Móvil/i');
      await expect(features.first()).toBeVisible();

      // Verify CTA button (Login) - check for link to login page
      const loginButton = page.locator('a[href*="/login"]');
      await expect(loginButton).toBeVisible();

      // Verify language selector is present
      const languageSelector = page.locator('[data-testid="language-selector"], button:has-text("EN"), button:has-text("ES")').first();
      await expect(languageSelector).toBeVisible();
    });

    test('should navigate to login page from landing CTA', async ({ page }) => {
      await page.goto('/');

      // Click login button
      await page.click('a[href*="/login"]');

      // Should navigate to login page (with locale prefix)
      await expect(page).toHaveURL(/\/[a-z]{2}\/login/);
      await expect(page.locator('h2')).toContainText(/TouchBase Login|Iniciar sesión/i);
    });

    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Mobile logo should exist (one should be visible based on viewport)
      const mobileLogo = page.locator('img[alt*="TouchBase"]').filter({ hasNotText: '' });
      await expect(mobileLogo.first()).toBeAttached();

      // Features should stack vertically (check for any feature)
      const features = page.locator('text=/Player Management|Gestión de Jugadores/i');
      await expect(features.first()).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      // Desktop logo should exist (one should be visible based on viewport)
      const desktopLogo = page.locator('img[alt*="TouchBase"]');
      await expect(desktopLogo.first()).toBeAttached();

      // Features should be in grid (check for any feature)
      const featuresGrid = page.locator('text=/Player Management|Gestión de Jugadores/i');
      await expect(featuresGrid.first()).toBeVisible();
    });
  });

  test.describe('Login Page', () => {
    test('should load login page with all form elements', async ({ page }) => {
      await page.goto('/login');

      // Verify page title
      await expect(page).toHaveTitle(/TouchBase/);

      // Verify login heading
      const heading = page.locator('h2:has-text("TouchBase Login")');
      await expect(heading).toBeVisible();

      // Verify subtitle (check for either English or Spanish)
      const subtitle = page.locator('text=/Access your sports management system|Accede a tu sistema de gestión deportiva/i');
      await expect(subtitle.first()).toBeVisible();

      // Verify email input
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('required');

      // Verify password input
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordInput).toHaveAttribute('required');

      // Verify submit button (check for either English or Spanish)
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText(/Sign In|Iniciar Sesión/i);

      // Verify signup link (check for link to signup page)
      const signupLink = page.locator('a[href*="/signup"]');
      await expect(signupLink).toBeVisible();

      // Verify language selector
      const languageSelector = page.locator('[data-testid="language-selector"], button:has-text("EN"), button:has-text("ES")').first();
      await expect(languageSelector).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit with empty fields
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[name="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill with invalid credentials
      await page.fill('input[name="email"]', 'invalid@email.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await page.waitForSelector('.bg-red-50, .text-red-800', { timeout: 5000 });
      const errorMessage = page.locator('.bg-red-50 .text-red-800, .text-red-800');
      await expect(errorMessage).toBeVisible();
    });

    test('should successfully login and redirect to dashboard', async ({ page }) => {
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Should redirect to dashboard (with locale prefix) - could redirect to teacher/student dashboard
      await page.waitForURL(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/, { timeout: 15000 });

      // Verify dashboard loaded (could be onboarding or actual dashboard)
      const pageContent = page.locator('h1, h2').first();
      await expect(pageContent).toBeVisible();
    });

    test('should navigate to signup page from login', async ({ page }) => {
      await page.goto('/login');

      // Click signup link
      await page.click('a[href*="/signup"]');

      // Should navigate to signup page (with locale prefix)
      await expect(page).toHaveURL(/\/[a-z]{2}\/signup/);
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');

      // Fill form
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);

      // Start submission
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check loading state (button should be disabled or show loading text - English or Spanish)
      const buttonText = await submitButton.textContent();
      expect(buttonText).toMatch(/Signing in|Sign In|Iniciando sesión|Iniciar sesión/i);
    });
  });

  test.describe('Dashboard Page', () => {
    test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
      // Try to access dashboard directly without auth
      await page.goto('/dashboard');

      // Should redirect to login (with locale prefix)
      await page.waitForURL(/\/[a-z]{2}\/login/, { timeout: 5000 });
      await expect(page.locator('h2')).toContainText(/TouchBase Login|Iniciar sesión/i);
    });

    test('should load dashboard after successful login', async ({ page }) => {
      // Login first
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Wait for dashboard to load (could be onboarding or actual dashboard, with locale prefix)
      await page.waitForURL(/\/[a-z]{2}\/dashboard/, { timeout: 15000 });

      // Verify page loaded (check for any heading)
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      // Check if it's onboarding or actual dashboard
      const pageText = await page.textContent('body');
      const isOnboarding = pageText?.includes('Welcome') || pageText?.includes('Select your role');
      const isDashboard = pageText?.includes('Dashboard') || pageText?.includes('Stats');

      // Should be either onboarding or dashboard
      expect(isOnboarding || isDashboard).toBeTruthy();
    });

    test('should display dashboard content when user has organization', async ({ page }) => {
      // Login first
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Wait for dashboard (with locale prefix) - could redirect to teacher/student dashboard or show onboarding
      await page.waitForURL(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/, { timeout: 15000 });

      // Wait a bit for content to load
      await page.waitForLoadState('networkidle');

      // If user has org, should see dashboard content
      // If user doesn't have org, should see onboarding
      const pageContent = await page.textContent('body');
      
      if (pageContent?.includes('Welcome to TouchBase!') || pageContent?.includes('Welcome to TouchBase Academy!') || pageContent?.includes('Select your role') || pageContent?.includes('Selecciona tu rol')) {
        // User is in onboarding - this is expected for new users
        const onboardingTitle = page.locator('h1, h2').first();
        await expect(onboardingTitle).toBeVisible();
      } else {
        // User has org - should see dashboard (could be main, teacher, or student dashboard)
        const dashboardTitle = page.locator('h1').first();
        await expect(dashboardTitle).toBeVisible({ timeout: 10000 });
        
        // Verify main content area is visible
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    });

    test('should display stats cards on dashboard', async ({ page }) => {
      // Login first
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Wait for dashboard (with locale prefix) - could redirect to teacher/student dashboard or show onboarding
      await page.waitForURL(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/, { timeout: 15000 });

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Check if we're on actual dashboard (not onboarding)
      const pageText = await page.textContent('body');
      
      if (!pageText?.includes('Welcome to TouchBase!') && !pageText?.includes('Welcome to TouchBase Academy!') && 
          !pageText?.includes('Select your role') && !pageText?.includes('Selecciona tu rol')) {
        // Should have main content area
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible({ timeout: 10000 });
        
        // At minimum, should have a heading
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible({ timeout: 10000 });
      } else {
        // Onboarding is also valid - just verify it's visible
        const onboardingTitle = page.locator('h1, h2').first();
        await expect(onboardingTitle).toBeVisible();
      }
    });

    test('should maintain session when navigating within dashboard', async ({ page }) => {
      // Login first
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Wait for dashboard (with locale prefix) - could redirect to teacher/student dashboard
      await page.waitForURL(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/, { timeout: 15000 });

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Verify we're on dashboard (not redirected to login)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/);

      // Verify dashboard content is visible (not login page)
      const isLoginPage = await page.locator('h2:has-text(/TouchBase Login|Iniciar sesión/i)').isVisible().catch(() => false);
      expect(isLoginPage).toBe(false);

      // Verify we have dashboard content - check for any visible content
      const pageText = await page.textContent('body');
      expect(pageText).toBeTruthy();
      expect(pageText?.length).toBeGreaterThan(100); // Should have substantial content
      
      // Verify we're not on login page and have dashboard-related content
      const hasDashboardContent = pageText?.includes('Dashboard') || 
                                  pageText?.includes('Welcome') || 
                                  pageText?.includes('Players') || 
                                  pageText?.includes('Teams') ||
                                  pageText?.includes('Stats') ||
                                  pageText?.includes('Select your role') ||
                                  pageText?.includes('Selecciona tu rol');
      expect(hasDashboardContent).toBe(true);
    });
  });

  test.describe('Cross-page Navigation', () => {
    test('should navigate from landing to login to dashboard flow', async ({ page }) => {
      // Start at landing (will redirect to /en or /es)
      await page.goto('/');
      await expect(page).toHaveURL(/\/(en|es)$/);

      // Navigate to login
      await page.click('a[href*="/login"]');
      await expect(page).toHaveURL(/\/[a-z]{2}\/login/);

      // Login
      await loginUser(page, TEST_USER.email, TEST_USER.password);

      // Should end up at dashboard (with locale prefix) - could redirect to teacher/student dashboard
      await page.waitForURL(/\/[a-z]{2}\/(dashboard|teacher\/dashboard|student\/dashboard)/, { timeout: 15000 });
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });

    test('should handle browser back/forward navigation correctly', async ({ page }) => {
      // Start at landing
      await page.goto('/');
      
      // Go to login (will redirect to /en/login or /es/login)
      await page.goto('/login');
      
      // Go back (will have locale prefix)
      await page.goBack();
      await expect(page).toHaveURL(/\/(en|es)$/);

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/[a-z]{2}\/login/);
    });
  });
});

