// OpenAI (via Netlify Function) client for Suno Lyrics

class OpenAIClient {
  constructor() {}

  // Compatibility no-ops to keep existing UI logic working
  loadApiKey() { return ''; }
  saveApiKey(_) {}
  clearApiKey() {}
  hasApiKey() { return true; }

  // Backend call helper
  async call(action, payload) {
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Hálózati hiba');
    }
    return await res.json();
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

