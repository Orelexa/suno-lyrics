// Gemini API Handler for Suno Lyrics Website
// API Key management and request handling

class GeminiAPI {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseURL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent';
        this.chatGptApiKey = this.loadChatGptApiKey();
    }

    // ChatGPT API kulcs betöltése localStorage-ból
    loadChatGptApiKey() {
        return localStorage.getItem('chatgpt_api_key') || '';
    }

    // ChatGPT API kulcs mentése
    saveChatGptApiKey(key) {
        this.chatGptApiKey = key;
        localStorage.setItem('chatgpt_api_key', key);
    }

    // ChatGPT API kulcs törlése
    clearChatGptApiKey() {
        this.chatGptApiKey = '';
        localStorage.removeItem('chatgpt_api_key');
    }

    // Ellenőrzi, hogy van-e beállított ChatGPT API kulcs
    hasChatGptApiKey() {
        return this.chatGptApiKey && this.chatGptApiKey.length > 0;
    }

    // API kulcs betöltése localStorage-ból
    loadApiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    }

    // API kulcs mentése
    saveApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    }

    // API kulcs törlése
    clearApiKey() {
        this.apiKey = '';
        localStorage.removeItem('gemini_api_key');
    }

    // Ellenőrzi, hogy van-e beállított API kulcs
    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    // Prompt küldése a Gemini API-hoz
    async sendPrompt(prompt, systemInstruction = '') {
        if (!this.hasApiKey()) {
            throw new Error('API kulcs nincs beállítva. Kérlek add meg a Gemini API kulcsot.');
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API hiba történt');
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Nem érkezett válasz az API-tól');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API hiba:', error);
            throw error;
        }
    }

    // Dalszöveg generálás
    async generateLyrics(theme, style, mood, language = 'English') {
        const prompt = `Írj egy dalszöveget az alábbi paraméterek alapján:
        
Téma: ${theme}
Stílus: ${style}
Hangulat: ${mood}
Nyelv: ${language}

A dalszöveg legyen érzelmes, kreatív és jól strukturált versszakokkal és refrénnel.
Használj verses struktúrát: [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus]`;

        return await this.sendPrompt(prompt);
    }

    // Dalszöveg fordítása
    async translateLyrics(lyrics, targetLanguage) {
        const prompt = `Fordítsd le a következő dalszöveget ${targetLanguage} nyelvre, 
        megtartva az érzelmi tartalmat és a költői stílust:
        
${lyrics}`;

        return await this.sendPrompt(prompt);
    }

    // Dalszöveg javítása/fejlesztése
    async improveLyrics(lyrics, instruction) {
        const prompt = `Javítsd/fejleszd a következő dalszöveget az alábbi utasítás alapján:
        
Utasítás: ${instruction}

Dalszöveg:
${lyrics}`;

        return await this.sendPrompt(prompt);
    }

    // Rímjavaslatok generálása
    async suggestRhymes(word) {
        const prompt = `Add meg 10 jó rímszót a következő szóra: "${word}"
        Csak a szavakat sorold fel, vesszővel elválasztva.`;

        return await this.sendPrompt(prompt);
    }

    // Metafora javaslatok
    async suggestMetaphors(theme) {
        const prompt = `Adj 5 kreatív metaforát vagy költői képet az alábbi témához: "${theme}"
        Minden metaforát új sorba írj.`;

        return await this.sendPrompt(prompt);
    }

    // Vers bővítése
    async expandVerse(verse, context) {
        const prompt = `Bővítsd ki a következő verset 2-4 újabb sorral, 
        megtartva a stílust és a témát:
        
Kontextus: ${context}

Vers:
${verse}`;

        return await this.sendPrompt(prompt);
    }

    // Hangulat és téma javaslat
    async suggestMoodAndTheme(keywords) {
        const prompt = `Az alábbi kulcsszavak alapján javasolj 3 zenei hangulatot 
        és 3 témát dalszöveghez:
        
Kulcsszavak: ${keywords}

Formátum:
Hangulatok: hangulat1, hangulat2, hangulat3
Témák: téma1, téma2, téma3`;

        return await this.sendPrompt(prompt);
    }

    // Dalszöveg struktúra elemzése
    async analyzeLyrics(lyrics) {
        const prompt = `Elemezd a következő dalszöveg szerkezetét, 
        azonosítsd a versszakokat, refrént, bridge részeket:
        
${lyrics}

Add meg a struktúrát (pl. [Verse 1], [Chorus], stb.) és rövid észrevételeket a rímekről, 
ritmusról.`;

        return await this.sendPrompt(prompt);
    }

    // Suno prompt optimalizálás
    async optimizeSunoPrompt(description, style, instruments) {
        const prompt = `Készíts egy optimalizált Suno AI prompt szöveget az alábbi alapján:
        
Leírás: ${description}
Stílus: ${style}
Hangszerek: ${instruments}

A prompt legyen tömör, de kifejező, és használjon Suno-kompatibilis kulcsszavakat.`;

        return await this.sendPrompt(prompt);
    }

    // Prompt rövidítése
    async shortenPrompt(prompt) {
        const systemInstruction = `Rövidítsd le a következő Suno prompt-ot 
        a lényeg megtartásával, max 150 karakterre:`;

        return await this.sendPrompt(prompt, systemInstruction);
    }

    // Prompt bővítése
    async expandPrompt(prompt) {
        const systemInstruction = `Bővítsd ki a következő Suno prompt-ot 
        részletesebb leírással és több jellemzővel:`;

        return await this.sendPrompt(prompt, systemInstruction);
    }

    // HU -> EN fordítás témához
    async translateThemeToEnglish(hungarianTheme) {
        const prompt = `Fordítsd angolra röviden és találóan (max 20 szó):
        
${hungarianTheme}`;

        return await this.sendPrompt(prompt);
    }

    // ========================================================================
    // SUNO LYRICS SKILL - Fő funkció
    // ========================================================================
    
    /**
     * Új angol dalszöveg generálása egy referencia dal struktúrája alapján
     * @param {string} referenceLyrics - Input 1: A referencia angol dalszöveg
     * @param {string} newTheme - Input 2: Az új téma
     * @returns {Object} { english: string, hungarian: string }
     */
    async generateStructuredLyrics(referenceLyrics, newTheme) {
        // Első lépés: Referencia elemzése és új angol szöveg generálása
        const systemInstruction = `Te egy profi dalszövegíró vagy, aki képes egy meglévő dal pontos szerkezetét, fonetikáját és rímképletét követni.

FONTOS SZABÁLYOK:
1. SORONKÉNT PONTOSAN UGYANANNYI SZÓTAG legyen, mint a referencia dalban
2. A SOR VÉGI RÍMEK azonos helyen legyenek (ha a referencia 2. és 4. sora rímel, az új dalban is)
3. A VERSSZAK STRUKTÚRA pontosan ugyanaz legyen ([Verse 1], [Chorus], [Bridge], stb.)
4. A RITMUS és HANGSÚLY hasonló legyen
5. Minden sort új sorba írj
6. A szöveg természetes és érzelmes legyen az új témához`;

        const prompt = `Referencia dalszöveg (angol):
${referenceLyrics}

---

Új téma: ${newTheme}

---

Feladat: Írj egy TELJESEN ÚJ angol dalszöveget az új témáról, ami PONTOSAN követi a referencia dal:
- Soronkénti szótagszámát
- Rímképletét (mely sorok rímelnek)
- Versszak struktúráját ([Verse], [Chorus], stb.)
- Ritmikai felépítését

A dalszöveg tartalmilag az ÚJ TÉMÁRÓL szóljon, de formailag azonos legyen a referenciával.

Csak a dalszöveget írd ki, semmi mást. A versszak jelöléseket ([Verse 1], stb.) is tartsd meg.`;

        try {
            const englishLyrics = await this.sendPrompt(prompt, systemInstruction);
            
            // Második lépés: Magyar fordítás
            const hungarianLyrics = await this.translateGeneratedLyrics(englishLyrics);
            
            return {
                english: englishLyrics.trim(),
                hungarian: hungarianLyrics.trim()
            };
        } catch (error) {
            console.error('Strukturált dalszöveg generálási hiba:', error);
            throw error;
        }
    }

    /**
     * A generált angol dalszöveg magyar fordítása (ChatGPT használatával)
     * @param {string} englishLyrics - Az angol dalszöveg
     * @returns {string} Magyar fordítás
     */
    async translateGeneratedLyrics(englishLyrics) {
        if (!this.hasChatGptApiKey()) {
            throw new Error('ChatGPT API kulcs nincs beállítva. Kérlek add meg a ChatGPT API kulcsot a fordításhoz.');
        }

        const systemPrompt = `Te egy profi fordító vagy, aki dalszövegeket fordít angolról magyarra. 
A fordítás legyen természetes, költői és jól hangozzon magyarul. 
Tartsd meg a versszak jelöléseket ([Verse 1], [Chorus], stb.) magyarul: [1. versszak], [Refrén], stb.`;

        const userPrompt = `Fordítsd le magyarra a következő angol dalszöveget:

${englishLyrics}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.chatGptApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'ChatGPT API hiba történt');
            }

            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0) {
                throw new Error('Nem érkezett fordítás a ChatGPT-től');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('ChatGPT API hiba:', error);
            throw error;
        }
    }

    /**
     * Referencia dalszöveg elemzése (opcionális segédfunkció)
     * @param {string} lyrics - A dalszöveg
     * @returns {string} Elemzés (szótagszámok, rímek, struktúra)
     */
    async analyzeLyricsStructure(lyrics) {
        const prompt = `Elemezd részletesen a következő dalszöveg szerkezetét:

${lyrics}

Add meg:
1. Versszak struktúra ([Verse], [Chorus], stb.)
2. Soronként a szótagszámokat
3. A rímképletet (mely sorok rímelnek)
4. Speciális ritmus vagy hangsúly jellemzők

Formázd strukturáltan, hogy könnyen érthető legyen.`;

        return await this.sendPrompt(prompt);
    }
}

// Globális példány létrehozása
const geminiAPI = new GeminiAPI();

// Export, ha module rendszerben használjuk
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAPI;
}
