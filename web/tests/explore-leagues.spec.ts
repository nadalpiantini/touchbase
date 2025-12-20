import { test, expect } from '@playwright/test';

test.describe('Exploración de Ligas/Torneos', () => {
  test('Login y explorar sección de Ligas', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('http://localhost:3000/es/login');

    // Esperar que la página cargue
    await page.waitForLoadState('networkidle');

    // Hacer login
    await page.fill('input[type="email"]', 'nadalpiantini@gmail.com');
    await page.fill('input[type="password"]', 'Teclados#13');
    await page.click('button[type="submit"]');

    // Esperar navegación después del login
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Tomar screenshot del dashboard
    await page.screenshot({ path: 'tests/screenshots/dashboard-after-login.png', fullPage: true });

    // Buscar enlaces/botones que contengan "Liga", "Torneo", "Tournament", "Clasificación"
    const ligasText = await page.getByText(/liga|torneo|tournament|clasificaci[oó]n/i).all();
    console.log('Elementos encontrados con texto de ligas:', ligasText.length);

    // Buscar en la navegación
    const navLinks = await page.locator('nav a, aside a').all();
    console.log('Total de enlaces en navegación:', navLinks.length);

    for (const link of navLinks) {
      const text = await link.textContent();
      console.log('Link:', text);

      if (text && /liga|torneo|tournament|clasificaci[oó]n/i.test(text)) {
        console.log('¡ENCONTRADO! Link de ligas:', text);
        await link.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'tests/screenshots/seccion-ligas.png', fullPage: true });
        break;
      }
    }

    // Verificar la estructura del dashboard
    const pageContent = await page.content();
    console.log('¿Página contiene "liga"?:', pageContent.toLowerCase().includes('liga'));
    console.log('¿Página contiene "torneo"?:', pageContent.toLowerCase().includes('torneo'));
    console.log('¿Página contiene "tournament"?:', pageContent.toLowerCase().includes('tournament'));

    // Buscar secciones del dashboard
    const sections = await page.locator('section, div[class*="section"], main > div').all();
    console.log('Total de secciones en la página:', sections.length);
  });

  test('Verificar API de torneos', async ({ request }) => {
    // Intentar acceder a la API de torneos (si existe)
    const endpoints = [
      '/api/tournaments',
      '/api/matches',
      '/api/standings',
      '/api/ligas'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await request.get(`http://localhost:3000${endpoint}`);
        console.log(`${endpoint}: ${response.status()}`);
        if (response.ok()) {
          const data = await response.json();
          console.log(`Data from ${endpoint}:`, JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.log(`${endpoint}: No disponible`);
      }
    }
  });
});
