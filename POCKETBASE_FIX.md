# PocketBase Regisztráció Engedélyezése

## Probléma
A regisztráció 400-as hibakódot ad vissza: "Failed to create record."

## Megoldás

### 1. Menj a PocketBase Admin felületre
Nyisd meg: http://192.168.1.122:8090/_/

### 2. Users Collection Beállítása

1. Kattints a **Collections** menüre
2. Válaszd ki a **users** collection-t
3. Kattints az **API rules** fülre

### 3. Create Rule Beállítása - NAGYON FONTOS! ⚠️

A **Create rule** mezőt **TELJESEN ÜRESEN** kell hagyni!

```
(üres mező - ne írj semmit)
```

**❌ ROSSZ beállítások (NE használd ezeket):**
- `@request.auth.id != ""` - Ez csak bejelentkezett usereket engedélyez (ördögi kör!)
- `@request.auth.id = id` - Ez sem jó regisztrációhoz

**✅ JÓ beállítás:**
- **TELJESEN ÜRES MEZŐ** - Ez engedélyezi a nyilvános regisztrációt

**FONTOS:** Ha a Create rule mező tartalmaz BÁRMIT (még szóközt is), töröld ki TELJESEN!

### 4. Options Tab Ellenőrzése

Menj az **Options** fülre és ellenőrizd:

- ✅ **Allow email/password auth** - BE kell kapcsolni
- ✅ **Allow username auth** - BE kell kapcsolni (opcionális)
- ⚠️ **Require email verification** - Fejlesztéshez kapcsold KI

### 5. Mentés

Kattints a **Save** gombra.

### 6. Újrapróbálkozás

Most már működnie kell a regisztrációnak az alkalmazásban!

---

## Ellenőrzés

Ha még mindig nem működik, ellenőrizd:

1. A PocketBase szerver fut-e: http://192.168.1.122:8090/api/health
2. A CORS beállítások helyesek-e (Settings → Application → Allowed origins)
3. A console-ban nincs-e más hibaüzenet
