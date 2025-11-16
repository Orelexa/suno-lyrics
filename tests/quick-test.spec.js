const { test, expect } = require('@playwright/test');

/**
 * Gyors teszt - Alapvető kapcsolat ellenőrzése
 */

test('Alapvető kapcsolat teszt', async ({ page }) => {
  console.log('🔍 Navigálás az oldalra...');

  // Navigálás és response ellenőrzése
  const response = await page.goto('http://192.168.1.122/suno-lyrics/', {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });

  // 404 hiba ellenőrzése
  expect(response.status()).toBe(200);
  console.log('✅ HTTP Status:', response.status());

  // Ellenőrizzük, hogy nincs 404 vagy hasonló hiba
  const pageContent = await page.content();
  expect(pageContent).not.toContain('404');
  expect(pageContent).not.toContain('Not Found');

  console.log('✅ Oldal betöltve, nincs 404 hiba');

  // Screenshot
  await page.screenshot({ path: 'tests/screenshots/page-loaded.png' });
  console.log('📸 Screenshot készült');

  // Ellenőrizzük az alkalmazás címét
  const title = await page.locator('h1').textContent();
  console.log('📝 Oldal címe:', title);

  // Alapvető assertion
  await expect(page.locator('h1')).toBeVisible();
  console.log('✅ H1 elem látható');

  // Generálás gomb keresése
  const generateBtn = page.locator('#generateBtn');
  const isVisible = await generateBtn.isVisible();
  console.log('🔘 Generálás gomb látható:', isVisible);

  await expect(generateBtn).toBeVisible();
  console.log('✅ Generálás gomb megtalálva');
});

test('Generálás gomb kattintás teszt', async ({ page }) => {
  console.log('🔍 Navigálás...');

  const response = await page.goto('http://192.168.1.122/suno-lyrics/', {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });

  // 404 hiba ellenőrzése
  expect(response.status()).toBe(200);
  console.log('✅ Oldal betöltve, HTTP Status:', response.status());

  // Generálás gomb kattintás
  const generateBtn = page.locator('#generateBtn');
  await generateBtn.click();
  console.log('🖱️ Generálás gombra kattintottam');

  // Várunk egy kicsit
  await page.waitForTimeout(500);

  // Modal ellenőrzése
  const modal = page.locator('#generateModal');
  const modalDisplay = await modal.evaluate(el => window.getComputedStyle(el).display);
  console.log('📋 Modal display:', modalDisplay);

  // Screenshot
  await page.screenshot({ path: 'tests/screenshots/modal-opened.png' });
  console.log('📸 Modal screenshot készült');

  await expect(modal).toBeVisible();
  console.log('✅ Modal megnyílt');
});
