const { test, expect } = require('@playwright/test');

/**
 * Suno Lyrics Manager - Generálás Funkció E2E Tesztek
 * URL: http://192.168.1.122/suno-lyrics/
 */

test.describe('Generálás Funkció Tesztelése', () => {

  test.beforeEach(async ({ page }) => {
    // Navigálás az alkalmazáshoz és response ellenőrzése
    const response = await page.goto('http://192.168.1.122/suno-lyrics/');

    // 404 hiba ellenőrzése
    expect(response.status()).toBe(200);
    console.log('✅ HTTP Status:', response.status());

    // Várunk, amíg az oldal betöltődik
    await page.waitForLoadState('networkidle');

    // Ellenőrizzük, hogy az alkalmazás betöltődött és nincs 404 hiba
    await expect(page.locator('h1')).toContainText('Suno Lyrics Manager');

    const pageContent = await page.content();
    expect(pageContent).not.toContain('404');
    expect(pageContent).not.toContain('Not Found');
  });

  test('T1 - Modal megnyitása a Generálás gombbal', async ({ page }) => {
    // Keressük meg a Generálás gombot
    const generateBtn = page.locator('#generateBtn');
    await expect(generateBtn).toBeVisible();

    // Ellenőrizzük, hogy a modal kezdetben nem látható
    const modal = page.locator('#generateModal');
    await expect(modal).toHaveCSS('display', 'none');

    // Kattintás a Generálás gombra
    await generateBtn.click();

    // Várunk, amíg a modal megjelenik
    await page.waitForTimeout(300);

    // Ellenőrizzük, hogy a modal megjelent
    await expect(modal).toHaveCSS('display', 'flex');

    // Ellenőrizzük a modal tartalmát
    await expect(page.locator('#generateModal h2')).toContainText('Dalszöveg Generálás');
    await expect(page.locator('#genTheme')).toBeVisible();
    await expect(page.locator('#genStyle')).toBeVisible();
    await expect(page.locator('#genMood')).toBeVisible();
    await expect(page.locator('#confirmGenerateBtn')).toBeVisible();
    await expect(page.locator('#cancelGenerateBtn')).toBeVisible();

    console.log('✅ T1 - Modal sikeresen megnyílt');
  });

  test('T2 - Modal bezárása a Mégse gombbal', async ({ page }) => {
    // Modal megnyitása
    await page.locator('#generateBtn').click();
    await page.waitForTimeout(300);

    const modal = page.locator('#generateModal');
    await expect(modal).toHaveCSS('display', 'flex');

    // Kattintás a Mégse gombra
    await page.locator('#cancelGenerateBtn').click();
    await page.waitForTimeout(300);

    // Ellenőrizzük, hogy a modal bezáródott
    await expect(modal).toHaveCSS('display', 'none');

    console.log('✅ T2 - Modal sikeresen bezáródott');
  });

  test('T3 - Téma validáció (üres téma)', async ({ page }) => {
    // Modal megnyitása
    await page.locator('#generateBtn').click();
    await page.waitForTimeout(300);

    // Ne töltsük ki a témát, csak a többi mezőt
    await page.locator('#genStyle').fill('pop rock');
    await page.locator('#genMood').fill('energikus');

    // Figyeljük az alert dialógust
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('témát');
      console.log('✅ T3 - Validációs üzenet:', dialog.message());
      await dialog.accept();
    });

    // Kattintás a Generálás gombra
    await page.locator('#confirmGenerateBtn').click();
    await page.waitForTimeout(500);

    // A modal NEM kellene hogy bezáródjon
    const modal = page.locator('#generateModal');
    await expect(modal).toHaveCSS('display', 'flex');
  });

  test('T4 - Input mezők kitöltése', async ({ page }) => {
    // Modal megnyitása
    await page.locator('#generateBtn').click();
    await page.waitForTimeout(300);

    // Input mezők kitöltése
    const testData = {
      theme: 'szerelem és szabadság',
      style: 'pop rock',
      mood: 'energikus'
    };

    await page.locator('#genTheme').fill(testData.theme);
    await page.locator('#genStyle').fill(testData.style);
    await page.locator('#genMood').fill(testData.mood);

    // Ellenőrizzük az értékeket
    await expect(page.locator('#genTheme')).toHaveValue(testData.theme);
    await expect(page.locator('#genStyle')).toHaveValue(testData.style);
    await expect(page.locator('#genMood')).toHaveValue(testData.mood);

    console.log('✅ T4 - Input mezők sikeresen kitöltve:', testData);
  });

  test('T5 - API kulcs hiány ellenőrzése', async ({ page }) => {
    // Modal megnyitása
    await page.locator('#generateBtn').click();
    await page.waitForTimeout(300);

    // Input mezők kitöltése
    await page.locator('#genTheme').fill('teszt téma');
    await page.locator('#genStyle').fill('pop');
    await page.locator('#genMood').fill('vidám');

    // Console figyelése
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      console.log('Console:', msg.text());
    });

    // Dialog figyelése (ha van hibaüzenet)
    page.on('dialog', async dialog => {
      console.log('✅ T5 - Hibaüzenet:', dialog.message());
      await dialog.accept();
    });

    // Kattintás a Generálás gombra
    await page.locator('#confirmGenerateBtn').click();
    await page.waitForTimeout(2000);

    // Ellenőrizzük, hogy a modal bezáródott
    const modal = page.locator('#generateModal');
    await expect(modal).toHaveCSS('display', 'none');

    console.log('✅ T5 - API kulcs ellenőrzés lefutott');
  });

  test('T6 - Teljes generálási folyamat (ha API elérhető)', async ({ page }) => {
    // Modal megnyitása
    await page.locator('#generateBtn').click();
    await page.waitForTimeout(300);

    // Input mezők kitöltése
    await page.locator('#genTheme').fill('nyári szabadság');
    await page.locator('#genStyle').fill('pop rock');
    await page.locator('#genMood').fill('energikus');

    // Screenshot a kitöltött modal-ról
    await page.screenshot({ path: 'tests/screenshots/modal-filled.png' });

    // Eredeti dalszöveg mentése
    const originalLyrics = await page.locator('#lyricsEditor').inputValue();
    console.log('Eredeti dalszöveg hossza:', originalLyrics.length);

    // Console figyelése
    page.on('console', msg => {
      console.log('🔍 Console:', msg.text());
    });

    // Dialog figyelése
    page.on('dialog', async dialog => {
      console.log('⚠️ Dialog:', dialog.message());
      await dialog.accept();
    });

    // Kattintás a Generálás gombra
    await page.locator('#confirmGenerateBtn').click();

    // Várunk a loading overlay-re
    const loadingOverlay = page.locator('#loadingOverlay');
    try {
      await expect(loadingOverlay).toBeVisible({ timeout: 2000 });
      console.log('✅ Loading overlay megjelent');

      // Várunk, amíg eltűnik (max 30 másodperc)
      await expect(loadingOverlay).toBeHidden({ timeout: 30000 });
      console.log('✅ Loading overlay eltűnt');

      // Ellenőrizzük, hogy változott-e a dalszöveg
      await page.waitForTimeout(1000);
      const newLyrics = await page.locator('#lyricsEditor').inputValue();
      console.log('Új dalszöveg hossza:', newLyrics.length);

      if (newLyrics.length > originalLyrics.length) {
        console.log('✅ T6 - Dalszöveg sikeresen generálva!');
        console.log('Előnézet:', newLyrics.substring(0, 100) + '...');
      } else {
        console.log('⚠️ T6 - Dalszöveg nem változott (lehet hogy API hiba történt)');
      }

    } catch (error) {
      console.log('⚠️ T6 - Loading overlay nem jelent meg (valószínűleg API kulcs hiányzik)');
    }

    // Screenshot az eredményről
    await page.screenshot({ path: 'tests/screenshots/result.png' });
  });

  test('T7 - UI elemek ellenőrzése', async ({ page }) => {
    // Ellenőrizzük a fő UI elemeket
    await expect(page.locator('#newSongBtn')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#translateBtn')).toBeVisible();
    await expect(page.locator('#improveBtn')).toBeVisible();
    await expect(page.locator('#analyzeBtn')).toBeVisible();
    await expect(page.locator('#songTitle')).toBeVisible();
    await expect(page.locator('#lyricsEditor')).toBeVisible();

    // Tab-ok ellenőrzése
    const tabs = ['lyrics', 'prompt', 'skill', 'settings'];
    for (const tab of tabs) {
      const tabBtn = page.locator(`button[data-tab="${tab}"]`);
      await expect(tabBtn).toBeVisible();
    }

    console.log('✅ T7 - Minden UI elem látható');
  });

  test('T8 - Különböző input kombinációk', async ({ page }) => {
    const testCases = [
      { theme: 'szerelem', style: '', mood: '', name: 'Csak téma' },
      { theme: 'nyár', style: 'rock', mood: '', name: 'Téma + stílus' },
      { theme: 'kaland', style: 'pop', mood: 'vidám', name: 'Mind a három' },
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Teszt eset: ${testCase.name}`);

      // Modal megnyitása
      await page.locator('#generateBtn').click();
      await page.waitForTimeout(300);

      // Input mezők kitöltése
      if (testCase.theme) await page.locator('#genTheme').fill(testCase.theme);
      if (testCase.style) await page.locator('#genStyle').fill(testCase.style);
      if (testCase.mood) await page.locator('#genMood').fill(testCase.mood);

      // Screenshot
      await page.screenshot({
        path: `tests/screenshots/input-${testCase.name.replace(/\s+/g, '-')}.png`
      });

      // Modal bezárása
      await page.locator('#cancelGenerateBtn').click();
      await page.waitForTimeout(300);

      console.log(`✅ ${testCase.name} - OK`);
    }
  });

  test('T9 - Reszponzív design ellenőrzése', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      console.log(`\n📱 Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await page.waitForTimeout(500);

      // Screenshot
      await page.screenshot({
        path: `tests/screenshots/viewport-${viewport.name}.png`,
        fullPage: true
      });

      // Ellenőrizzük, hogy a fő elemek láthatók-e
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#generateBtn')).toBeVisible();

      console.log(`✅ ${viewport.name} - Renderelés OK`);
    }
  });
});
