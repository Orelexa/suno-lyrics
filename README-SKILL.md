# 🎵 Suno Lyrics SKILL Generator

Modern webes alkalmazás angol dalszövegek generálására **referencia dal szerkezete alapján**. A generált dalszöveg pontosan követi a referencia dal szótagszámát, rímképletét és versszak-struktúráját.

## ✨ Fő Funkció

### Input
1. **Referencia dalszöveg (angol)** - Ez lesz a minta a szerkezetre
2. **Új téma** - Az új dal témája

### Output
1. **Angol dalszöveg** - Új dal az új témáról, de ugyanazzal a szerkezettel:
   - ✅ Soronként azonos szótagszám
   - ✅ Azonos rímképlet (sor végi rímek)
   - ✅ Azonos versszak struktúra ([Verse], [Chorus], [Bridge], stb.)
   - ✅ Hasonló ritmus és hangsúly

2. **Magyar fordítás** - Az angol dalszöveg magyar fordítása

## 🎯 Példa

### Referencia dalszöveg:
```
[Verse 1]
Walking down the empty street at night (8 szótag)
Shadows dancing in the pale moonlight (9 szótag)
Every step I take feels so alone (8 szótag)
Wishing I could find my way back home (9 szótag)

[Chorus]
Take me back to yesterday (7 szótag)
When the world felt far away (7 szótag)
...
```

### Új téma: "boldogság és remény"

### Generált output:
```
[Verse 1]
Running through the sunshine filled with joy (8 szótag)
Laughter echoing like a little boy (9 szótag)
Every moment shines with colors bright (8 szótag)
Hope is guiding me towards the light (9 szótag)

[Chorus]
Living life in happiness (7 szótag)
Finding hope in every breath (7 szótag)
...
```

## 📦 Telepítés

### 1. Fájlok letöltése
Töltsd le a projekt összes fájlját.

### 2. Fájlstruktúra
```
suno-lyrics-website/
├── index-skill.html          # Fő HTML (SKILL verzió)
├── index.html                # Teljes verzió (több funkcióval)
├── css/
│   └── styles.css           # Stílusok
└── js/
    ├── gemini.js            # Gemini API kezelés
    ├── suno-skill-app.js    # SKILL alkalmazás logika
    └── app.js               # Teljes verzió logika
```

### 3. Használat
1. Nyisd meg az **`index-skill.html`** fájlt böngészőben
2. Add meg a **Gemini API kulcsot** (ingyenes: https://aistudio.google.com/app/apikey)
3. Használd a generátort!

## 🚀 Használati Útmutató

### 1. API Kulcsok Beállítása

**Gemini API kulcs** (dalszöveg generáláshoz):
- Szerezz be egy ingyenes kulcsot a [Google AI Studio](https://aistudio.google.com/app/apikey)-ban
- Ez generálja az új angol dalszöveget

**ChatGPT API kulcs** (fordításhoz):
- Szerezz be egy kulcsot az [OpenAI Platform](https://platform.openai.com/api-keys)-on
- Ez fordítja le magyarra az angol szöveget
- Fizetős, de nagyon olcsó (pár cent/dal)

Mindkét kulcsot írd be és kattints a **💾 Mentés** gombra. Az API státusz jelző zöldre vált, ha mindkettő be van állítva.

### 2. Dalszöveg Generálás

1. **Referencia dalszöveg megadása**
   - Másold be az angol referencia dalszöveget az **Input 1** mezőbe
   - Fontos: Használj versszak jelöléseket ([Verse 1], [Chorus], stb.)

2. **Új téma megadása**
   - Add meg az új dal témáját az **Input 2** mezőben
   - Pl: "boldogság és remény", "téli szerelem", "kaland"

3. **Generálás**
   - Kattints az **✨ Dalszöveg Generálás** gombra
   - Várj 10-30 másodpercet
   - Az eredmény megjelenik az Output szekcióban

4. **Eredmény használata**
   - Válts az 🇬🇧 **Angol** és 🇭🇺 **Magyar** tab között
   - **📋 Másolás** - Vágólapra másolás
   - **💾 Mentés Fájlba** - .txt fájl letöltése
   - **📤 Mindkettő Exportálása** - JSON formátumban

### 3. Referencia Elemzése (opcionális)
- Kattints a **📊 Referencia Elemzése** gombra
- Az AI részletesen elemzi a referencia dal szerkezetét
- Hasznos, ha érdekel a pontos felépítés

## 🎼 Tippek a Legjobb Eredményhez

### Referencia dalszöveg választása
✅ **Jó referencia:**
- Világos versszak struktúra ([Verse], [Chorus], stb.)
- Konzisztens szótagszám
- Egyértelmű rímképlet
- Természetes angol nyelvtan

❌ **Kerülendő:**
- Túl rövid szövegek (< 8 sor)
- Inkonzisztens szerkezet
- Bonyolult, nem szabványos formázás

### Téma megadása
✅ **Jó témák:**
- Konkrétak: "nyári szerelem a tengerparton"
- Érzelmi: "bánat és megbánás"
- Leíró: "kaland a hegyekben, szabadság"

❌ **Kerülendő:**
- Túl általános: "élet"
- Túl összetett: "kvantumfizika és szerelem"

## 🛠️ Technikai Részletek

### Használt Technológiák
- **Frontend:** Vanilla JavaScript (ES6+)
- **UI:** Modern CSS3 Dark Theme
- **AI (Generálás):** Google Gemini 1.5 Flash API
- **AI (Fordítás):** OpenAI ChatGPT-4o-mini API
- **Tárolás:** Browser LocalStorage

### API Funkciók (gemini.js)

```javascript
// Fő funkció
geminiAPI.generateStructuredLyrics(referenceLyrics, newTheme)
// → { english: string, hungarian: string }

// Elemzés
geminiAPI.analyzeLyricsStructure(lyrics)
// → string (részletes elemzés)

// Fordítás
geminiAPI.translateGeneratedLyrics(englishLyrics)
// → string (magyar fordítás)
```

### Adattárolás
- **API kulcs:** `localStorage.getItem('gemini_api_key')`
- Csak a böngészőben tárolódik, nincs szerver oldali mentés

## 📱 Böngésző Támogatás

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔒 Biztonság és Adatvédelem

- ✅ Az API kulcs **csak a böngészőben** tárolódik (LocalStorage)
- ✅ **Nincs szerver oldali tárolás** vagy naplózás
- ✅ A dalszövegek **nem kerülnek mentésre** (csak a böngésző memóriájában)
- ⚠️ HTTPS ajánlott production használathoz

## 🎵 Kapcsolódó Fájlok

- **index-skill.html** - Egyszerűsített SKILL verzió (csak a fő funkció)
- **index.html** - Teljes verzió (több AI eszköz, prompt generálás)
- **SKILL.md** - A teljes SKILL dokumentáció (Claude skill formátumban)

## 💡 Továbbfejlesztési Lehetőségek

- [ ] Több nyelv támogatása
- [ ] Audio előnézet integráció
- [ ] Több AI modell (Claude, ChatGPT)
- [ ] Felhő mentés opció
- [ ] Közösségi megosztás
- [ ] Suno API integráció

## 📄 Licensz

MIT License - Szabadon használható és módosítható

## 👨‍💻 Készítő

Készült ❤️-tel a Suno közösségnek

---

## 🆘 Gyakori Problémák

### "API kulcs nincs beállítva"
→ Add meg a Gemini API kulcsot a beállításokban

### "API hiba történt"
→ Ellenőrizd az API kulcsot, vagy próbáld újra

### "Nem érkezett válasz az API-tól"
→ Internetkapcsolat ellenőrzése, vagy várj egy kicsit és próbáld újra

### A generált szöveg nem követi pontosan a struktúrát
→ Ez ritka, de előfordulhat. Próbáld újra generálni, vagy használj egyszerűbb referencia dalszöveget

---

**Jó dalszöveg-írást! 🎵✨**
