# Backend Server Setup

## Áttekintés

Az alkalmazás OpenAI integrációhoz egy Node.js Express backend-et használ, ami proxyként működik az OpenAI API felé.

## Követelmények

- Node.js (v14 vagy újabb)
- npm vagy yarn
- OpenAI API kulcs

## Telepítés

1. **Függőségek telepítése:**
```bash
npm install
```

2. **OpenAI API kulcs beállítása:**

Hozz létre egy `.env` fájlt a projekt gyökérkönyvtárában:
```bash
cp .env.example .env
```

Szerkeszd a `.env` fájlt és add meg az OpenAI API kulcsodat:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxx
```

## Backend indítása

Futtasd a következő parancsot:
```bash
npm run server
```

vagy

```bash
npm run dev
```

A szerver elindul a `http://192.168.1.122:3001` címen (vagy `http://localhost:3001`).

## Endpoint

**POST** `/api/openai`

### Request body:
```json
{
  "action": "generate",
  "payload": {
    "theme": "szerelem",
    "style": "pop rock",
    "mood": "energikus"
  }
}
```

### Támogatott akciók:

- `generate` - Dalszöveg generálás
- `generate_structured` - Strukturált dalszöveg generálás SKILL módszerrel
- `translate` - Dalszöveg fordítás
- `improve` - Dalszöveg javítás
- `analyze` - Dalszöveg elemzés
- `optimize_prompt` - Suno prompt optimalizálás
- `shorten_prompt` - Prompt rövidítés
- `expand_prompt` - Prompt bővítés
- `translate_theme_en` - Magyar téma fordítása angolra

## Tesztelés

A backend teszteléséhez:

1. Indítsd el a backend szervert: `npm run server`
2. Indítsd el a Laragon webszervert
3. Nyisd meg az alkalmazást a böngészőben: `http://192.168.1.122/suno-lyrics/`
4. Kattints a "Generálás" gombra és teszteld a funkciót

## Hibaelhárítás

### "Missing OPENAI_API_KEY" hiba
- Ellenőrizd, hogy létrehoztad-e a `.env` fájlt
- Ellenőrizd, hogy az `OPENAI_API_KEY` helyesen van-e beállítva

### "Hálózati hiba" vagy 404
- Ellenőrizd, hogy a backend szerver fut-e
- Ellenőrizd, hogy a `gemini.js` fájl a megfelelő URL-t használja-e (`http://192.168.1.122:3001/api/openai`)
- Ellenőrizd a CSP header-t az `index.html` fájlban

### CORS hiba
- A backend már beállítva van CORS támogatással, de ha továbbra is problémák vannak, ellenőrizd a böngésző konzolt

## Architektúra

```
Böngésző (Laragon/80)
    ↓
gemini.js (fetch)
    ↓
Node.js Express Backend (:3001)
    ↓
OpenAI API (https://api.openai.com)
```

A PocketBase (:8090) külön fut és csak az adatok tárolásáért felelős (felhasználók, dalok).
