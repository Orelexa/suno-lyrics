# PocketBase Regisztráció Hiba Fix

## ❌ Hiba: "Failed to create record"

Ez a hiba általában akkor jelenik meg, ha:
1. A PocketBase **users** collection nincs megfelelően konfigurálva
2. Az email vagy username már létezik
3. Hiányzó mezők a users collection-ben

---

## 🔧 GYORS FIX - Lépésről lépésre

### 1️⃣ Nyisd meg a PocketBase Admin felületet

```
http://192.168.1.122:8090/_/
```

**Bejelentkezési adatok:**
- Email: admin@example.com (vagy amit létrehoztál)
- Jelszó: az admin jelszó

---

### 2️⃣ Ellenőrizd a "users" collection-t

1. Menj a **Collections** fülre (bal oldali menü)
2. Keresd meg a **users** collection-t
3. Ha **NEM létezik**, hozd létre:

#### Users collection létrehozása:

**Kattints a "New collection" gombra:**
- **Type:** Auth collection
- **Name:** `users`
- **Auth options:**
  - ✅ Allow username auth
  - ✅ Allow email auth
  - ❌ Require email verification (OPCIONÁLIS, teszteléshez kapcsold ki!)

**Mezők (már automatikusan létrejönnek):**
- `id` (text)
- `username` (text, required, unique)
- `email` (email, required, unique)
- `emailVisibility` (bool)
- `verified` (bool)
- `password` (password, required, min 8 karakteres)

**Kattints "Create" gombra!**

---

### 3️⃣ API Rules beállítása (FONTOS!)

A **users** collection-ben állítsd be az API Rules-t:

1. Kattints a users collection mellett a **beállítások ikonra** (fogaskerék)
2. Menj az **API Rules** fülre

#### Minimális beállítások (teszteléshez):

**Create (POST) rule:**
```javascript
// Engedélyezd a regisztrációt mindenki számára
// Hagyd ÜRESEN vagy írd be: @request.data.email != ""
```

**List/Search (GET) rule:**
```javascript
// Csak saját profil látható
@request.auth.id != ""
```

**View (GET) rule:**
```javascript
// Csak saját profil látható
id = @request.auth.id
```

**Update (PATCH) rule:**
```javascript
// Csak saját profil szerkeszthető
id = @request.auth.id
```

**Delete (DELETE) rule:**
```javascript
// Csak saját profil törölhető
id = @request.auth.id
```

**Mentsd el!**

---

### 4️⃣ Ellenőrizd a "songs" collection-t (opcionális)

Ha még nincs, hozd létre:

**Kattints "New collection":**
- **Type:** Base collection
- **Name:** `songs`

**Mezők:**
- `title` (text, required)
- `lyrics` (text)
- `prompt` (text)
- `user` (relation → users, required)

**API Rules:**
- Create: `@request.auth.id != ""`
- List: `user = @request.auth.id`
- View: `user = @request.auth.id`
- Update: `user = @request.auth.id`
- Delete: `user = @request.auth.id`

---

## 🧪 TESZT - Ellenőrizd a beállításokat

### Opció 1: PocketBase teszt oldal

Nyisd meg:
```
http://192.168.1.122/suno-lyrics/test-pocketbase.html
```

1. **Test Connection** - Ellenőrzi a PocketBase elérhetőségét
2. **Check Collections** - Ellenőrzi a users és songs collection-öket
3. **Test Registration** - Próbáld ki a regisztrációt
4. **Test Login** - Próbáld ki a bejelentkezést

### Opció 2: Közvetlen teszt az alkalmazásban

1. Nyisd meg: `http://192.168.1.122/suno-lyrics/`
2. Kattints a **"Bejelentkezés"** gombra
3. Válts a **"Regisztráció"** fülre
4. Töltsd ki:
   - Felhasználónév: `testuser123`
   - Email: `test@example.com`
   - Jelszó: `testpass123` (min 8 karakter)
   - Jelszó megerősítés: `testpass123`
5. Kattints **"Regisztráció"**
6. Nyisd meg a **Developer Tools (F12) → Console** fület
7. Nézd meg a részletes hibát!

---

## 🔍 Gyakori hibák és megoldások

### 1. "Failed to create record" - Email már létezik

**Megoldás:** Használj másik email címet vagy töröld a létező felhasználót a PocketBase Admin-ban.

### 2. "Failed to create record" - Username már létezik

**Megoldás:** Használj másik felhasználónevet.

### 3. "Failed to create record" - Validation error

**Ellenőrizd:**
- A jelszó legalább 8 karakter hosszú?
- Az email formátum helyes?
- A username nem tartalmaz speciális karaktereket?

### 4. "Failed to authenticate" - API Rules hiba

**Megoldás:** Ellenőrizd az API Rules beállításokat (lásd fent).

### 5. PocketBase nem elérhető

**Ellenőrizd:**
```bash
# Windows parancssor
netstat -ano | findstr :8090
```

Ha nem fut, indítsd el:
```bash
cd path\to\pocketbase
pocketbase serve --http=192.168.1.122:8090
```

---

## 📋 Következő lépések

1. **Javítottam a kódot** - Most részletesebb hibaüzeneteket kapsz
2. **Nyisd meg a Console-t (F12)** - Nézd meg a pontos hibát
3. **Küldd el a Console üzeneteket** - Így tovább tudom segíteni

---

## 🆘 Ha még mindig nem működik

Küldd el:
1. A **Console üzenet** screenshot-ját (F12 → Console)
2. A **Network** fül hibáját (F12 → Network → kattints a /api/collections/users/records hívásra)
3. PocketBase verzió: `pocketbase --version`

**Már javítottam a kódot**, szóval most sokkal jobb hibaüzeneteket fogsz kapni! 🎯
