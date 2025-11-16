# Gyors Teszt Útmutató - API Fix

## ✅ Mi lett javítva?

A **"Failed to fetch"** és **404 hibák** megoldva!

## 🚀 TESZTELÉS (2 lehetőség)

### 1️⃣ OPCIÓ A: Közvetlen API hívás (GYORS TESZT)

**Előnyök:** Gyors, nincs szükség backend szerverre
**Hátrányok:** API kulcs a böngészőben látható (NEM biztonságos!)

#### Lépések:

1. **Nyisd meg a `js/config.js` fájlt**
   ```javascript
   const CONFIG = {
     OPENAI_API_KEY: 'sk-proj-mi4-wfhtUjSp...',  // ← IDE A TELJES API KULCSOT!
     USE_BACKEND: false  // ← FALSE = közvetlen API hívás
   };
   ```

2. **Mentsd el a fájlt**

3. **Nyisd meg az alkalmazást:**
   ```
   http://192.168.1.122/suno-lyrics/
   ```

4. **Nyisd meg a Developer Tools-t (F12)**
   - Console fül: Nézd a hibákat
   - Network fül: Nézd az API hívásokat

5. **Teszteld a Generálás gombot:**
   - Kattints a "Generálás" gombra
   - Töltsd ki: Téma, Stílus, Hangulat
   - Kattints a "Generálás" gombra
   - Várd meg az eredményt!

---

### 2️⃣ OPCIÓ B: Backend szerver használata (BIZTONSÁGOS)

**Előnyök:** Biztonságos, API kulcs a szerveren
**Hátrányok:** Indítani kell a backend szervert

#### Lépések:

1. **Hozd létre a `.env` fájlt:**
   ```bash
   # Projekt gyökérkönyvtárban (T:\suno-lyrics)
   OPENAI_API_KEY=sk-proj-mi4-wfhtUjSp...
   ```

2. **Állítsd be a `js/config.js` fájlt:**
   ```javascript
   const CONFIG = {
     OPENAI_API_KEY: '',  // ← Üresen hagyható
     USE_BACKEND: true  // ← TRUE = backend használata
   };
   ```

3. **Indítsd el a backend szervert:**
   ```bash
   cd T:\suno-lyrics
   npm run server
   ```

   Várd meg, hogy megjelenjen:
   ```
   🚀 OpenAI Proxy Server running on http://localhost:3001
   ```

4. **Új terminálban nyisd meg az alkalmazást:**
   ```
   http://192.168.1.122/suno-lyrics/
   ```

5. **Teszteld a Generálás gombot** (ugyanúgy, mint az A opciónál)

---

## 🔍 Hibakeresés

### "Failed to fetch" hiba továbbra is jelentkezik?

1. **Ellenőrizd a böngésző Console-t (F12 → Console):**
   - "Hiányzó vagy érvénytelen API kulcs" → Állítsd be a `js/config.js` fájlban
   - "Backend nem elérhető" → Indítsd el: `npm run server`

2. **Ellenőrizd a Network fület (F12 → Network):**
   - Ha `api.openai.com` látszik → Közvetlen API hívás (USE_BACKEND: false)
   - Ha `192.168.1.122:3001` látszik → Backend használata (USE_BACKEND: true)
   - Ha **404** vagy **CORS hiba** → CSP header probléma (de már javítva van!)

3. **Ellenőrizd a `js/config.js` tartalmát:**
   ```javascript
   // Így HELYES (közvetlen API híváshoz):
   const CONFIG = {
     OPENAI_API_KEY: 'sk-proj-TELJES_KULCS_IDE',
     USE_BACKEND: false
   };
   ```

### CORS vagy CSP hiba?

Az `index.html` CSP header-je már tartalmazza:
```html
connect-src 'self' https://api.openai.com http://192.168.1.122:8090 http://192.168.1.122:3001
```

Ha mégsem működik, töröld ki a CSP meta taget ideiglenes teszteléshez.

---

## 📝 Fájlok áttekintése

```
T:\suno-lyrics/
├── js/
│   ├── config.js              ← API kulcs (NE kommitold!)
│   ├── config.example.js      ← Példa fájl (kommitolható)
│   ├── gemini.js              ← Javított OpenAI client
│   ├── pocketbase.js          ← PocketBase (8090) - működik
│   └── app-pocketbase.js      ← Fő alkalmazás logika
├── server.js                  ← Backend szerver (3001)
├── .env                       ← Backend API kulcs (NE kommitold!)
├── .env.example               ← Példa fájl
└── index.html                 ← Frissített CSP header
```

---

## 🎯 Következő lépések

1. **Válaszd az A vagy B opciót** (gyors teszt = A, biztonságos = B)
2. **Állítsd be az API kulcsot**
3. **Teszteld a Generálás gombot**
4. **Ellenőrizd a Console és Network füleket**
5. **Ha működik:** 🎉 Kész!
6. **Ha nem működik:** Küldd el a Console üzeneteket!

---

## ⚠️ BIZTONSÁGI FIGYELMEZTETÉS

**SOHA NE KOMMITOLD** az alábbi fájlokat Git-be:
- `js/config.js` (már a .gitignore-ban van)
- `.env` (már a .gitignore-ban van)

Csak a példa fájlokat kommitold:
- `js/config.example.js` ✅
- `.env.example` ✅
