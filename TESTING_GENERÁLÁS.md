# Generálás Funkció Tesztelési Dokumentáció

## Tesztelési Környezet
- **URL**: http://localhost:8000
- **Teszt Dátum**: 2025-11-13
- **Tesztelt Funkció**: Dalszöveg generálás

## Előkészületek

### 1. Szerver Indítása
```bash
cd T:\suno-lyrics
python -m http.server 8000
```

### 2. Alkalmazás Megnyitása
- Nyisd meg a böngésződben: http://localhost:8000
- Ellenőrizd, hogy az alkalmazás betöltődött-e

## Tesztelési Lépések

### Teszt 1: Modal Megnyitása
**Cél**: Ellenőrizni, hogy a Generálás gomb megnyitja-e a modalt

**Lépések**:
1. Nyisd meg az alkalmazást
2. Lépj a "Dalszöveg" fülre (alapértelmezetten aktív)
3. Kattints a "Generálás" gombra

**Elvárt Eredmény**:
- A modal dialógus megjelenik
- A modal címe: "Dalszöveg Generálás"
- Három input mező látható:
  - Téma (placeholder: "pl. szerelem, nyár, szabadság")
  - Stílus (placeholder: "pl. pop, rock, ballad")
  - Hangulat (placeholder: "pl. vidám, melankolikus, energikus")
- Két gomb látható: "Generálás" és "Mégse"

**Kód Hivatkozás**:
- index.html:52 - Generálás gomb
- index.html:165-185 - Modal struktúra
- app-pocketbase.js:760-762 - openGenerateModal()

---

### Teszt 2: Modal Bezárása "Mégse" Gombbal
**Cél**: Ellenőrizni a modal bezárási funkcióját

**Lépések**:
1. Nyisd meg a generálás modalt (előző teszt)
2. Kattints a "Mégse" gombra

**Elvárt Eredmény**:
- A modal eltűnik
- Az alkalmazás visszatér az előző állapotba

**Kód Hivatkozás**: app-pocketbase.js:764-766 - closeGenerateModal()

---

### Teszt 3: Generálás API Kulcs Nélkül
**Cél**: Ellenőrizni a hibaüzenet megjelenítését, ha nincs API kulcs

**Lépések**:
1. Nyisd meg a generálás modalt
2. Töltsd ki a mezőket:
   - Téma: "szerelem"
   - Stílus: "pop"
   - Hangulat: "vidám"
3. Kattints a "Generálás" gombra

**Elvárt Eredmény** (ha nincs API kulcs):
- Hibaüzenet: "API kulcs nincs beállítva!"
- Az alkalmazás átkapcsol a Settings fülre
- A modal bezáródik

**Kód Hivatkozás**: app-pocketbase.js:515-519

---

### Teszt 4: Téma Hiányában Generálás
**Cél**: Ellenőrizni a validációt

**Lépések**:
1. Nyisd meg a generálás modalt
2. Hagyd üresen a Téma mezőt
3. Kattints a "Generálás" gombra

**Elvárt Eredmény**:
- Hibaüzenet: "Kérlek add meg a témát!"
- A modal nem záródik be

**Kód Hivatkozás**: app-pocketbase.js:508-511

---

### Teszt 5: Sikeres Generálás (Mock Teszt)
**Cél**: Ellenőrizni a teljes generálási folyamatot

**Előfeltétel**: API kulcs be van állítva (OpenAI/Netlify function elérhető)

**Lépések**:
1. Bejelentkezés az alkalmazásba (ha szükséges)
2. Új dal létrehozása vagy meglévő kiválasztása
3. Generálás modal megnyitása
4. Input mezők kitöltése:
   - Téma: "nyári szabadság"
   - Stílus: "pop rock"
   - Hangulat: "energikus"
5. "Generálás" gomb megnyomása

**Elvárt Eredmény**:
1. Loading overlay megjelenik: "Dalszöveg generálása..."
2. A modal bezáródik
3. Konzol üzenet: "⏳ Dalszöveg generálása..."
4. API hívás történik a Netlify function-höz
5. A generált dalszöveg megjelenik a `lyricsEditor` textarea-ban
6. Loading overlay eltűnik
7. Sikeres üzenet: "✅ Dalszöveg sikeresen generálva!"

**Kód Hivatkozás**:
- app-pocketbase.js:503-532 - generateLyricsFromModal()
- gemini.js:26-30 - generateLyrics()

---

### Teszt 6: Hálózati Hiba Kezelése
**Cél**: Ellenőrizni a hiba kezelést

**Szimuláció**:
- Kapcsold ki az internetet
- Vagy állítsd le a Netlify function-t

**Lépések**:
1. Próbálj meg generálást indítani
2. Várj a hiba üzenetre

**Elvárt Eredmény**:
- Hibaüzenet jelenik meg
- Loading overlay eltűnik
- Alert ablak: "❌ Hiba: [hibaüzenet]"

**Kód Hivatkozás**: app-pocketbase.js:528-531

---

## Kód Flow Diagram

```
User Action: Kattintás "Generálás" gombra
    ↓
openGenerateModal() (app-pocketbase.js:760)
    ↓
User Input: Téma, Stílus, Hangulat
    ↓
User Action: Kattintás "Generálás" gombra (modal-ban)
    ↓
generateLyricsFromModal() (app-pocketbase.js:503)
    ↓
Validáció: Téma kötelező? (508)
    ↓ (ha üres)
    Hibaüzenet: "Kérlek add meg a témát!"
    ↓ (ha ok)
closeGenerateModal() (513)
    ↓
API Kulcs ellenőrzés (515)
    ↓ (ha nincs)
    Hibaüzenet + átváltás Settings fülre
    ↓ (ha van)
showOverlay("Dalszöveg generálása...") (523)
    ↓
geminiAPI.generateLyrics(theme, style, mood) (524)
    ↓
OpenAIClient.call('generate', {theme, style, mood}) (gemini.js:27)
    ↓
fetch('/.netlify/functions/openai') (gemini.js:14)
    ↓
Backend Processing (OpenAI API)
    ↓
Response visszatérés
    ↓ (siker)
lyricsEditor.value = lyrics (525)
showMessage("Dalszöveg sikeresen generálva!", 'success') (526)
hideOverlay() (527)
    ↓ (hiba)
showMessage("Hiba: [error]", 'error') (529)
hideOverlay() (530)
```

## Checklist

- [ ] Modal megnyitás működik
- [ ] Modal bezárás működik (Mégse gomb)
- [ ] Téma validáció működik (üres téma esetén)
- [ ] API kulcs hiány ellenőrzés működik
- [ ] Loading overlay megjelenik
- [ ] API hívás megtörténik
- [ ] Eredmény megjelenik a textarea-ban
- [ ] Sikeres üzenet megjelenik
- [ ] Hiba kezelés működik

## Ismert Korlátozások

1. **Netlify Function Függőség**: Az alkalmazás Netlify function-ön keresztül hívja az OpenAI API-t
2. **Autentikáció**: PocketBase autentikáció szükséges a teljes funkcionalitáshoz
3. **Offline Mód**: Nem támogatott, internet kapcsolat kötelező

## Javaslatok További Tesztekhez

1. **Különböző Input Kombinációk**:
   - Csak téma megadása
   - Téma + stílus
   - Mind a három mező kitöltése
   - Különböző nyelvek tesztelése

2. **Edge Case-ek**:
   - Nagyon hosszú input szövegek
   - Speciális karakterek (emoji, unicode)
   - HTML/Script injekció próbák

3. **Performance Tesztek**:
   - API válaszidő mérése
   - Timeout kezelés
   - Párhuzamos kérések

4. **UI/UX Tesztek**:
   - Reszponzív design ellenőrzése
   - Mobil böngészőkön tesztelés
   - Különböző böngészők (Chrome, Firefox, Safari, Edge)

## Teszt Eredmények Sablon

| Teszt ID | Teszt Név | Állapot | Megjegyzés | Dátum |
|----------|-----------|---------|------------|-------|
| T1 | Modal megnyitása | ⏳ Pending | | |
| T2 | Modal bezárása | ⏳ Pending | | |
| T3 | API kulcs hiány | ⏳ Pending | | |
| T4 | Téma validáció | ⏳ Pending | | |
| T5 | Sikeres generálás | ⏳ Pending | | |
| T6 | Hiba kezelés | ⏳ Pending | | |

## Következő Lépések

1. Nyisd meg a böngészőt: http://localhost:8000
2. Kövesd a fenti tesztelési lépéseket
3. Dokumentáld az eredményeket
4. Készíts screenshot-okat a kritikus lépésekről
5. Jelentsd a talált hibákat
