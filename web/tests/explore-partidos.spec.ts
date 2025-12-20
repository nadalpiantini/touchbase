import { test, expect } from '@playwright/test';

test.describe('Exploración de Partidos', () => {
  test('Login y explorar sección de Partidos', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('http://localhost:3000/es/login');
    await page.waitForLoadState('networkidle');

    // Hacer login
    await page.fill('input[type="email"]', 'nadalpiantini@gmail.com');
    await page.fill('input[type="password"]', 'Teclados#13');
    await page.click('button[type="submit"]');

    // Esperar navegación
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Hacer clic en "Partidos" en el menú de navegación
    await page.getByRole('link', { name: 'Partidos' }).click();
    await page.waitForLoadState('networkidle');

    // Tomar screenshot
    await page.screenshot({ path: 'tests/screenshots/seccion-partidos.png', fullPage: true });

    // Ver qué hay en la página
    const pageContent = await page.textContent('body');
    console.log('Contenido de la página de Partidos (primeros 500 chars):', pageContent?.substring(0, 500));

    // Buscar tablas o listas
    const tables = await page.locator('table').all();
    console.log('Número de tablas:', tables.length);

    const lists = await page.locator('ul, ol').all();
    console.log('Número de listas:', lists.length);

    // Buscar si hay datos de partidos/matches
    const matchElements = await page.getByText(/partido|match|game|vs|score/i).all();
    console.log('Elementos relacionados con partidos:', matchElements.length);

    // Verificar URL
    console.log('URL actual:', page.url());
  });
});
