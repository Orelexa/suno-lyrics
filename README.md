# 🎵 Suno Lyrics Manager

Modern webes alkalmazás Suno dalszövegek kezelésére, generálására és Gemini AI integrációval.

## Funkciók

### 🎼 Dalszöveg Kezelés
- **Új dalok létrehozása** és mentése
- **Dalszöveg szerkesztő** kényelmes szerkesztési környezettel
- **Dalok listája** gyors áttekintéshez és váltáshoz
- **Export/Import** funkció JSON formátumban

### 🤖 AI-alapú Funkciók (Gemini API)
- **Dalszöveg generálás** téma, stílus és hangulat alapján
- **Fordítás** többnyelvű támogatással
- **Dalszöveg javítás** AI segítségével
- **Szerkezet elemzés** versszakok, refrén azonosítása
- **Rím javaslatok** és metaforák generálása

### 🎯 Suno Prompt Generátor
- **Prompt generálás** zenei paraméterek alapján
- **Optimalizálás** Suno-kompatibilis formátumra
- **Rövidítés/Bővítés** igény szerint
- **Magyar → Angol fordítás** témákhoz
- **Egyszerű másolás** vágólapra

## Telepítés és Használat

### Követelmények
- Modern webböngésző (Chrome, Firefox, Safari, Edge)
- Gemini API kulcs (ingyenes regisztráció: https://aistudio.google.com/app/apikey)

### Telepítés

1. **Fájlok letöltése**
   - Töltsd le a projekt összes fájlját
   - Helyezd őket egy könyvtárba

2. **Fájlstruktúra**
   ```
   suno-lyrics-website/
   ├── index.html
   ├── css/
   │   └── styles.css
   └── js/
       ├── gemini.js
       └── app.js
   ```

3. **Megnyitás**
   - Nyisd meg az `index.html` fájlt a böngésződben
   - Vagy használj helyi szervert (pl. VS Code Live Server)

### API Kulcs Beállítása

1. Kattints a **⚙️ Beállítások** gombra
2. Illeszd be a Gemini API kulcsot
3. Kattints a **💾 API Kulcs mentése** gombra
4. Az állapot jelző zöldre vált, ha sikeres

## Használati Útmutató

### Új Dal Létrehozása

1. Kattints az **➕ Új dal** gombra
2. Add meg a dal címét
3. Írj vagy generálj dalszöveget
4. Mentsd el a **💾 Mentés** gombbal

### Dalszöveg Generálás

1. Kattints a **✨ Generálás** gombra
2. Add meg:
   - Témát (pl. "szerelem és veszteség")
   - Stílust (pl. "pop rock")
   - Hangulatot (pl. "melankolikus")
3. Az AI generálja a dalszöveget

### Suno Prompt Készítés

1. Válts a **Suno Prompt** fülre
2. Add meg a zenei paramétereket:
   - Téma/Leírás
   - Zenei stílus
   - Hangulat
   - Hangszerek
3. Kattints a **✨ Prompt generálás** gombra
4. Másold ki a **📋 Másolás** gombbal

### Dalok Exportálása/Importálása

**Export:**
1. Menj a **Beállítások** fülre
2. Kattints az **📤 Dalok exportálása** gombra
3. JSON fájl letöltődik

**Import:**
1. Kattints az **📥 Dalok importálása** gombra
2. Válaszd ki a JSON fájlt
3. Erősítsd meg az importálást

## Technikai Részletek

### Használt Technológiák
- **Frontend:** Vanilla JavaScript (ES6+)
- **UI:** Modern CSS3 (Dark Theme)
- **API:** Google Gemini Pro
- **Tárolás:** Browser LocalStorage

### Fájlok Áttekintése

**index.html**
- Fő HTML struktúra
- UI komponensek és layout

**css/styles.css**
- Modern dark theme design
- Reszponzív layout
- Animációk és átmenetek

**js/gemini.js**
- Gemini API kezelés
- AI funkciók implementációja
- API kulcs tárolás

**js/app.js**
- Fő alkalmazás logika
- Dalok kezelése
- UI események kezelése
- LocalStorage műveletek

### LocalStorage Adatok

Az alkalmazás a következő adatokat tárolja:
- `gemini_api_key` - API kulcs
- `suno_songs` - Dalok tömbje (JSON)

### Adatszerkezet (Song Object)

```javascript
{
  id: "song_1234567890_abc123",
  title: "Dal címe",
  lyrics: "Dalszöveg tartalma...",
  prompt: "Generált Suno prompt",
  date: "2025-11-01T12:00:00.000Z"
}
```

## API Végpontok (Gemini)

Az alkalmazás a következő Gemini funkciókat használja:

- `generateLyrics()` - Dalszöveg generálás
- `translateLyrics()` - Fordítás
- `improveLyrics()` - Dalszöveg javítás
- `analyzeLyrics()` - Szerkezet elemzés
- `optimizeSunoPrompt()` - Prompt optimalizálás
- `shortenPrompt()` - Prompt rövidítés
- `expandPrompt()` - Prompt bővítés
- `translateThemeToEnglish()` - Magyar → Angol fordítás

## Böngésző Támogatás

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Biztonság

- Az API kulcs csak a böngészőben tárolódik (LocalStorage)
- Nincs szerver oldali tárolás
- HTTPS ajánlott production használathoz

## Továbbfejlesztési Lehetőségek

- [ ] Firebase/Backend integráció
- [ ] Felhasználói fiókok
- [ ] Felhő alapú mentés
- [ ] Verziókezelés dalokhoz
- [ ] Együttműködési funkciók
- [ ] Még több AI modell támogatása
- [ ] Audio preview integráció
- [ ] Suno direct API integráció

## Licensz

MIT License - Szabadon használható és módosítható

## Kapcsolat

GitHub: [Ide kerül a repository link]

---

**Készítve ❤️-tel a Suno közösségnek**
