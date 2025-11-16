# PocketBase Setup Guide

## 1. PocketBase Telepítés

Ha még nincs telepítve a PocketBase:

1. Töltsd le: https://pocketbase.io/docs/
2. Indítsd el: `./pocketbase serve --http 192.168.1.122:8090`
3. Admin UI: http://192.168.1.122:8090/_/

## 2. Collections Létrehozása

### Songs Collection

A PocketBase admin felületén (http://192.168.1.122:8090/_/) hozd létre a következő collection-t:

**Collection Name:** `songs`

**Fields:**
- `user` (Relation)
  - Type: Relation
  - Related collection: users
  - Single relation
  - Required: Yes

- `title` (Text)
  - Type: Text
  - Required: No
  - Megjegyzés: Az alapértelmezett "Névtelen dal" értéket a JavaScript kódban adjuk meg új dal létrehozásakor (a PocketBase nem támogatja a Default érték beállítását Text mezőknél)

- `lyrics` (Text)
  - Type: Text (Long text)
  - Required: No

- `prompt` (Text)
  - Type: Text (Long text)
  - Required: No

**API Rules:**

```javascript
// List Rule (csak saját dalokat lásson)
@request.auth.id != "" && user = @request.auth.id

// View Rule (csak saját dalokat lásson)
@request.auth.id != "" && user = @request.auth.id

// Create Rule (csak bejelentkezett felhasználó hozhat létre)
@request.auth.id != "" && user = @request.auth.id

// Update Rule (csak saját dalokat módosíthat)
@request.auth.id != "" && user = @request.auth.id

// Delete Rule (csak saját dalokat törölhet)
@request.auth.id != "" && user = @request.auth.id
```

## 3. Users Collection Beállítása

A PocketBase automatikusan létrehozza a `users` collection-t. Ellenőrizd a beállításokat:

**API Rules:**
- Create: Engedélyezd a regisztrációt (vagy hagyd, hogy csak admin hozhassa létre)
- View: `@request.auth.id != ""`
- Update: `@request.auth.id = id`
- Delete: `@request.auth.id = id`

**Auth Options:**
- Email/Password: Enabled
- Verification: Optional (ajánlott)

## 4. Séma Export (JSON)

Ha szeretnéd exportálni a sémát, használd ezt a parancsot:

```bash
./pocketbase export
```

## 5. Kapcsolat Tesztelése

Ellenőrizd, hogy elérhető-e a PocketBase:

```bash
curl http://192.168.1.122:8090/api/health
```

## 6. CORS Beállítások

Ha localhost-ról nyitod meg az alkalmazást, lehet, hogy be kell állítanod a CORS-t:

1. Menj a PocketBase admin felületre
2. Settings → Application
3. Allowed origins: `http://localhost`, `http://localhost:*`, `http://127.0.0.1:*`

## Migráció LocalStorage-ról

Az alkalmazás automatikusan felkínálja a migrációt az első bejelentkezéskor, ha talál LocalStorage-ben tárolt dalokat.

A migrációs funkció meghívása:
```javascript
await pocketbase.migrateSongsFromLocalStorage();
```

## Új Dal Létrehozása Alapértelmezett Címmel

Mivel a PocketBase nem támogatja az alapértelmezett értékek beállítását Text mezőknél, a JavaScript kódban kell megadni:

```javascript
async function createNewSong(userId, customTitle = null) {
  const record = await pb.collection('songs').create({
    user: userId,
    title: customTitle || 'Névtelen dal',  // Ha nincs customTitle, akkor "Névtelen dal"
    lyrics: '',
    prompt: ''
  });
  return record;
}
```

Használat:
```javascript
// Alapértelmezett címmel
await createNewSong(currentUser.id);

// Egyedi címmel
await createNewSong(currentUser.id, 'Az én új dalom');
```

---

**PocketBase URL a projektben:** http://192.168.1.122:8090
