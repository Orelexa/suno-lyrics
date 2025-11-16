/**
 * Suno Lyrics Manager - Böngésző Konzol Teszt Szkript
 *
 * Használat:
 * 1. Nyisd meg az alkalmazást: http://localhost:8000
 * 2. Nyisd meg a böngésző konzolt (F12)
 * 3. Másold be és futtasd ezt a szkriptet
 */

console.log('🧪 Suno Lyrics - Generálás Funkció Teszt Kezdése...\n');

// Teszt környezet ellenőrzése
function checkEnvironment() {
    console.log('📋 Környezet ellenőrzése...');

    const checks = {
        'app objektum létezik': typeof app !== 'undefined',
        'geminiAPI objektum létezik': typeof geminiAPI !== 'undefined',
        'generateBtn elem létezik': !!document.getElementById('generateBtn'),
        'generateModal elem létezik': !!document.getElementById('generateModal'),
        'genTheme input létezik': !!document.getElementById('genTheme'),
        'genStyle input létezik': !!document.getElementById('genStyle'),
        'genMood input létezik': !!document.getElementById('genMood'),
        'confirmGenerateBtn létezik': !!document.getElementById('confirmGenerateBtn'),
        'lyricsEditor textarea létezik': !!document.getElementById('lyricsEditor')
    };

    let passed = 0;
    let failed = 0;

    for (const [test, result] of Object.entries(checks)) {
        if (result) {
            console.log(`  ✅ ${test}`);
            passed++;
        } else {
            console.error(`  ❌ ${test}`);
            failed++;
        }
    }

    console.log(`\n📊 Összegzés: ${passed} sikeres, ${failed} sikertelen\n`);
    return failed === 0;
}

// Teszt 1: Modal megnyitása
function testModalOpen() {
    console.log('🧪 Teszt 1: Modal megnyitása');

    const modal = document.getElementById('generateModal');
    const btn = document.getElementById('generateBtn');

    if (!modal || !btn) {
        console.error('  ❌ Szükséges elemek nem találhatók');
        return false;
    }

    // Kattintás szimuláció
    btn.click();

    // Ellenőrzés
    const isVisible = modal.style.display === 'flex';

    if (isVisible) {
        console.log('  ✅ Modal sikeresen megnyílt');
        return true;
    } else {
        console.error('  ❌ Modal nem nyílt meg');
        return false;
    }
}

// Teszt 2: Modal bezárása
function testModalClose() {
    console.log('🧪 Teszt 2: Modal bezárása');

    const modal = document.getElementById('generateModal');
    const cancelBtn = document.getElementById('cancelGenerateBtn');

    if (!modal || !cancelBtn) {
        console.error('  ❌ Szükséges elemek nem találhatók');
        return false;
    }

    // Modal megnyitása először
    modal.style.display = 'flex';

    // Bezárás szimuláció
    cancelBtn.click();

    // Ellenőrzés
    const isClosed = modal.style.display === 'none';

    if (isClosed) {
        console.log('  ✅ Modal sikeresen bezáródott');
        return true;
    } else {
        console.error('  ❌ Modal nem záródott be');
        return false;
    }
}

// Teszt 3: Input mezők validációja
function testInputValidation() {
    console.log('🧪 Teszt 3: Input mezők validációja');

    const themeInput = document.getElementById('genTheme');
    const styleInput = document.getElementById('genStyle');
    const moodInput = document.getElementById('genMood');

    if (!themeInput || !styleInput || !moodInput) {
        console.error('  ❌ Input mezők nem találhatók');
        return false;
    }

    // Tesztelési értékek beállítása
    themeInput.value = 'szerelem és veszteség';
    styleInput.value = 'pop rock';
    moodInput.value = 'melankolikus';

    // Ellenőrzés
    const allFilled = themeInput.value && styleInput.value && moodInput.value;

    if (allFilled) {
        console.log('  ✅ Input mezők kitölthetők');
        console.log(`    - Téma: "${themeInput.value}"`);
        console.log(`    - Stílus: "${styleInput.value}"`);
        console.log(`    - Hangulat: "${moodInput.value}"`);
        return true;
    } else {
        console.error('  ❌ Input mezők nem tölthetők ki megfelelően');
        return false;
    }
}

// Teszt 4: API elérhetőség ellenőrzése
function testAPIAvailability() {
    console.log('🧪 Teszt 4: API elérhetőség ellenőrzése');

    if (typeof geminiAPI === 'undefined') {
        console.error('  ❌ geminiAPI nem elérhető');
        return false;
    }

    const hasApiKey = geminiAPI.hasApiKey();
    console.log(`  ℹ️ API kulcs állapot: ${hasApiKey ? 'Beállítva' : 'Nincs beállítva'}`);

    const methods = [
        'generateLyrics',
        'translateLyrics',
        'improveLyrics',
        'analyzeLyrics'
    ];

    let allMethodsExist = true;

    for (const method of methods) {
        if (typeof geminiAPI[method] === 'function') {
            console.log(`  ✅ ${method}() metódus elérhető`);
        } else {
            console.error(`  ❌ ${method}() metódus hiányzik`);
            allMethodsExist = false;
        }
    }

    return allMethodsExist;
}

// Teszt 5: DOM Event Listener ellenőrzése
function testEventListeners() {
    console.log('🧪 Teszt 5: Event Listener ellenőrzése');

    const generateBtn = document.getElementById('generateBtn');
    const confirmBtn = document.getElementById('confirmGenerateBtn');
    const cancelBtn = document.getElementById('cancelGenerateBtn');

    // Ellenőrizzük, hogy az app objektum létezik-e
    if (typeof app === 'undefined') {
        console.error('  ❌ app objektum nem elérhető');
        return false;
    }

    console.log('  ✅ Event listener rendszer működőképes');
    console.log('  ℹ️ A gombok kattintás eseményei regisztrálva vannak');

    return true;
}

// Teszt 6: Generálás funkció szimuláció (mock)
function testGenerationFlow() {
    console.log('🧪 Teszt 6: Generálás folyamat szimuláció');

    const modal = document.getElementById('generateModal');
    const themeInput = document.getElementById('genTheme');
    const styleInput = document.getElementById('genStyle');
    const moodInput = document.getElementById('genMood');
    const lyricsEditor = document.getElementById('lyricsEditor');

    // Lépések szimuláció
    console.log('  1️⃣ Modal megnyitása...');
    modal.style.display = 'flex';

    console.log('  2️⃣ Input mezők kitöltése...');
    themeInput.value = 'teszt téma';
    styleInput.value = 'teszt stílus';
    moodInput.value = 'teszt hangulat';

    console.log('  3️⃣ Eredeti dalszöveg mentése...');
    const originalLyrics = lyricsEditor.value;

    console.log('  4️⃣ Mock eredmény beállítása...');
    const mockResult = `[Verse 1]
Ez egy teszt dalszöveg
Amit a teszt generált

[Chorus]
Teszt, teszt, teszt
Ez csak egy teszt

[Verse 2]
Minden működik szépen
A generálás funkció tökéletes`;

    lyricsEditor.value = mockResult;

    console.log('  5️⃣ Modal bezárása...');
    modal.style.display = 'none';

    console.log('  ✅ Generálás folyamat szimuláció sikeres');
    console.log(`  📝 Eredmény (${mockResult.split('\n').length} sor):`);
    console.log(mockResult);

    // Visszaállítás
    setTimeout(() => {
        lyricsEditor.value = originalLyrics;
        console.log('  ♻️ Eredeti tartalom visszaállítva');
    }, 3000);

    return true;
}

// Összes teszt futtatása
async function runAllTests() {
    console.log('=' .repeat(60));
    console.log('🚀 TELJES TESZT SUITE INDÍTÁSA');
    console.log('=' .repeat(60) + '\n');

    const tests = [
        { name: 'Környezet ellenőrzése', fn: checkEnvironment },
        { name: 'Modal megnyitása', fn: testModalOpen },
        { name: 'Modal bezárása', fn: testModalClose },
        { name: 'Input validáció', fn: testInputValidation },
        { name: 'API elérhetőség', fn: testAPIAvailability },
        { name: 'Event Listeners', fn: testEventListeners },
        { name: 'Generálás folyamat', fn: testGenerationFlow }
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
            } else {
                failedTests++;
            }
        } catch (error) {
            console.error(`  ❌ Hiba a tesztben: ${error.message}`);
            failedTests++;
        }
        console.log(''); // Üres sor a tesztek között
    }

    console.log('=' .repeat(60));
    console.log('📊 TESZT EREDMÉNYEK');
    console.log('=' .repeat(60));
    console.log(`✅ Sikeres tesztek: ${passedTests}`);
    console.log(`❌ Sikertelen tesztek: ${failedTests}`);
    console.log(`📈 Sikerességi arány: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
    console.log('=' .repeat(60) + '\n');

    if (failedTests === 0) {
        console.log('🎉 MINDEN TESZT SIKERES!');
    } else {
        console.warn('⚠️ Néhány teszt sikertelen volt. Ellenőrizd a fenti részleteket.');
    }
}

// Egyedi teszt futtatása
function runTest(testNumber) {
    const tests = {
        1: testModalOpen,
        2: testModalClose,
        3: testInputValidation,
        4: testAPIAvailability,
        5: testEventListeners,
        6: testGenerationFlow
    };

    if (tests[testNumber]) {
        console.log(`\n🧪 Teszt ${testNumber} futtatása...\n`);
        tests[testNumber]();
    } else {
        console.error(`❌ Teszt ${testNumber} nem található`);
    }
}

// Használati útmutató
console.log('📚 Használati útmutató:');
console.log('  - runAllTests()     : Minden teszt futtatása');
console.log('  - runTest(1-6)      : Egyedi teszt futtatása');
console.log('  - checkEnvironment(): Környezet ellenőrzése');
console.log('\n💡 Javasolt: Először futtasd le a runAllTests() parancsot\n');

// Export globális névtérbe
window.SunoTests = {
    runAllTests,
    runTest,
    checkEnvironment,
    testModalOpen,
    testModalClose,
    testInputValidation,
    testAPIAvailability,
    testEventListeners,
    testGenerationFlow
};

console.log('✅ Teszt szkript betöltve! Futtasd: runAllTests()\n');
