import { test, expect } from '@playwright/test';

test.describe('Verificación UI de Ligas', () => {
  test('Debe mostrar la página de Ligas correctamente', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/es/login');
    await page.fill('input[type="email"]', 'nadalpiantini@gmail.com');
    await page.fill('input[type="password"]', 'Teclados#13');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verificar que existe el link de "Ligas" en la navegación
    const ligasLink = page.getByRole('link', { name: 'Ligas' });
    await expect(ligasLink).toBeVisible();

    // Click en Ligas
    await ligasLink.click();
    await page.waitForURL('**/leagues');

    // Verificar URL correcta
    expect(page.url()).toContain('/dashboard/leagues');

    // Verificar título de la página
    await expect(page.getByRole('heading', { name: /Ligas y Clasificaciones/i })).toBeVisible();

    // Verificar título del torneo
    await expect(page.getByText(/Spring Championship 2025/i)).toBeVisible();

    // Tomar screenshot
    await page.screenshot({ path: 'tests/screenshots/ligas-implementada.png', fullPage: true });

    console.log('✅ Página de Ligas renderizada correctamente');
    console.log('📍 URL:', page.url());
  });
});
