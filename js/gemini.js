// OpenAI client for Suno Lyrics
// Supports both backend proxy and direct API calls

class OpenAIClient {
  constructor() {
    // Check if CONFIG is available (from config.js)
    this.useBackend = typeof CONFIG !== 'undefined' ? CONFIG.USE_BACKEND : true;
    this.apiKey = typeof CONFIG !== 'undefined' ? CONFIG.OPENAI_API_KEY : null;
  }

  // Compatibility no-ops to keep existing UI logic working
  loadApiKey() { return ''; }
  saveApiKey(_) {}
  clearApiKey() {}
  hasApiKey() { return true; }

  // Main call helper - routes to backend or direct API
  async call(action, payload) {
    if (this.useBackend) {
      return await this.callBackend(action, payload);
    } else {
      return await this.callDirectAPI(action, payload);
    }
  }

  // Backend call (recommended for production)
  async callBackend(action, payload) {
    const res = await fetch('http://192.168.1.122:3001/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Hálózati hiba - Backend nem elérhető. Indítsd el: npm run server');
    }
    return await res.json();
  }

  // Direct API call (for testing only - NOT SECURE for production!)
  async callDirectAPI(action, payload) {
    if (!this.apiKey || this.apiKey === 'sk-proj-mi4-wfhtUjSp...') {
      throw new Error('Hiányzó vagy érvénytelen API kulcs! Állítsd be a js/config.js fájlban.');
    }

    const request = this.buildOpenAIRequest(action, payload);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'API hiba' }));
      throw new Error(error.error?.message || 'OpenAI API hiba');
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    // For structured generation, also get Hungarian translation
    if (action === 'generate_structured') {
      const translationReq = this.buildOpenAIRequest('translate_hu', { lyrics: content });
      const tRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(translationReq)
      });

      if (tRes.ok) {
        const tData = await tRes.json();
        const hu = tData.choices?.[0]?.message?.content ?? '';
        return { english: content.trim(), hungarian: hu.trim() };
      }
    }

    return { content };
  }

  // Build OpenAI request
  buildOpenAIRequest(action, payload = {}) {
    const model = 'gpt-4o-mini';
    const sys = (text) => ({ role: 'system', content: text });
    const usr = (text) => ({ role: 'user', content: text });

    switch (action) {
      case 'generate': {
        const { theme = '', style = '', mood = '' } = payload;
        return {
          model,
          messages: [
            sys('Te egy tapasztalt dalszövegíró vagy. Írj jól strukturált, érzelmes dalszöveget.'),
            usr(`Téma: ${theme}\nStílus: ${style}\nHangulat: ${mood}\n\nHasználj verses szerkezetet: [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus].\nCsak a dalszöveget add vissza.`)
          ],
          temperature: 0.9,
          max_tokens: 1200
        };
      }
      case 'generate_structured': {
        const { referenceLyrics = '', newTheme = '' } = payload;
        return {
          model,
          messages: [
            sys('Te egy profi dalszövegíró vagy. Készíts új angol dalszöveget úgy, hogy pontosan követi a referencia dal szótagszámát soronként, a sorvégi rímek elhelyezkedését, a versszakok struktúráját ([Verse], [Chorus], [Bridge], stb.), valamint a ritmust és hangsúlyokat. Csak a dalszöveget add vissza címkékkel együtt.'),
            usr(`Referencia dalszöveg (angol):\n${referenceLyrics}\n\n---\nÚj téma: ${newTheme}\n---\n\nFeladat: Írj teljesen új angol dalszöveget az új témáról, amely FORMÁJÁBAN (szótagszám, rímképlet, szakaszok) megegyezik a referenciával, de TARTALMÁBAN az új témáról szól.`)
          ],
          temperature: 0.9,
          max_tokens: 1400
        };
      }
      case 'translate': {
        const { lyrics = '', targetLanguage = 'Hungarian' } = payload;
        return {
          model,
          messages: [
            sys('Fordító vagy. Őrizd meg a költői hangulatot és formát.'),
            usr(`Fordítsd le a következő dalszöveget ${targetLanguage} nyelvre:\n\n${lyrics}`)
          ],
          temperature: 0.7,
          max_tokens: 1400
        };
      }
      case 'translate_hu': {
        const { lyrics = '' } = payload;
        return {
          model,
          messages: [
            sys('Fordító vagy. Fordíts angolról természetes, költői magyarra. Tartsd meg a [Verse]/[Chorus] jelöléseket magyarul: [1. versszak], [Refrén], [Bridge].'),
            usr(`Fordítsd magyarra a következő dalszöveget:\n\n${lyrics}`)
          ],
          temperature: 0.7,
          max_tokens: 1400
        };
      }
      case 'improve': {
        const { lyrics = '', instruction = '' } = payload;
        return {
          model,
          messages: [
            sys('Szerkesztő vagy. Finomítsd a dalszöveget a megadott instrukció szerint, őrizve a szerkezetet.'),
            usr(`Instrukció: ${instruction}\n\nDalszöveg:\n${lyrics}`)
          ],
          temperature: 0.7,
          max_tokens: 1200
        };
      }
      case 'analyze': {
        const { lyrics = '' } = payload;
        return {
          model,
          messages: [
            sys('Elemezd a dalszöveg szerkezetét, rímképletét és szótagszámait röviden, áttekinthetően.'),
            usr(`Elemezd az alábbi dalszöveget:\n\n${lyrics}`)
          ],
          temperature: 0.2,
          max_tokens: 800
        };
      }
      case 'optimize_prompt': {
        const { description = '', style = '', instruments = '' } = payload;
        return {
          model,
          messages: [
            sys('Generálj tömör, kifejező Suno-kompatibilis promptot angolul.'),
            usr(`Leírás: ${description}\nStílus: ${style}\nHangszerek: ${instruments}`)
          ],
          temperature: 0.7,
          max_tokens: 300
        };
      }
      case 'shorten_prompt': {
        const { text = '' } = payload;
        return {
          model,
          messages: [
            sys('Rövidítsd a következő promptot 150 karakter körülire, a lényeg megtartásával.'),
            usr(text)
          ],
          temperature: 0.5,
          max_tokens: 120
        };
      }
      case 'expand_prompt': {
        const { text = '' } = payload;
        return {
          model,
          messages: [
            sys('Bővítsd a promptot részletesebb, mégis tömör, hasznos jellemzőkkel.'),
            usr(text)
          ],
          temperature: 0.7,
          max_tokens: 300
        };
      }
      case 'translate_theme_en': {
        const { hungarianTheme = '' } = payload;
        return {
          model,
          messages: [
            sys('Fordítsd a magyar témát természetes, rövid (max 20 szó) angol leírássá.'),
            usr(hungarianTheme)
          ],
          temperature: 0.3,
          max_tokens: 60
        };
      }
      default:
        return { model, messages: [usr('Unknown action')] };
    }
  }

  // Lyrics generation (generic)
  async generateLyrics(theme, style, mood) {
    const { content } = await this.call('generate', { theme, style, mood });
    return content;
  }

  // Structured generation per SKILL
  async generateStructuredLyrics(referenceLyrics, newTheme) {
    const data = await this.call('generate_structured', { referenceLyrics, newTheme });
    return { english: data.english, hungarian: data.hungarian };
  }

  // Translation
  async translateLyrics(lyrics, targetLanguage) {
    const { content } = await this.call('translate', { lyrics, targetLanguage });
    return content;
  }

  // Improve
  async improveLyrics(lyrics, instruction) {
    const { content } = await this.call('improve', { lyrics, instruction });
    return content;
  }

  // Analyze
  async analyzeLyrics(lyrics) {
    const { content } = await this.call('analyze', { lyrics });
    return content;
  }

  // Prompt helpers
  async optimizeSunoPrompt(description, style, instruments) {
    const { content } = await this.call('optimize_prompt', { description, style, instruments });
    return content;
  }
  async shortenPrompt(text) {
    const { content } = await this.call('shorten_prompt', { text });
    return content;
  }
  async expandPrompt(text) {
    const { content } = await this.call('expand_prompt', { text });
    return content;
  }

  // HU -> EN for theme
  async translateThemeToEnglish(hungarianTheme) {
    const { content } = await this.call('translate_theme_en', { hungarianTheme });
    return content;
  }

  // For SKILL analysis helper
  async analyzeLyricsStructure(lyrics) { return this.analyzeLyrics(lyrics); }
}

// Global instance preserving original name used by app.js and index-skill.html
const geminiAPI = new OpenAIClient();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenAIClient;
}

