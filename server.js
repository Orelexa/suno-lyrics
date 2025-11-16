// Node.js Express Backend for OpenAI Proxy
// Run with: node server.js
// Requires: npm install express cors dotenv

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// OpenAI proxy endpoint
app.post('/api/openai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY in .env file' });
    }

    const { action, payload } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Missing action' });
    }

    const openaiRequest = buildOpenAIRequest(action, payload);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!response.ok) {
      const error = await safeJson(response);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    // For structured generation, get Hungarian translation
    if (action === 'generate_structured') {
      const translationReq = buildOpenAIRequest('translate_hu', { lyrics: content });
      const tRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(translationReq),
      });

      if (!tRes.ok) {
        const err = await safeJson(tRes);
        return res.status(tRes.status).json(err);
      }

      const tData = await tRes.json();
      const hu = tData.choices?.[0]?.message?.content ?? '';
      return res.json({ english: content.trim(), hungarian: hu.trim() });
    }

    res.json({ content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: String(error) });
  }
});

function buildOpenAIRequest(action, payload = {}) {
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
          usr(`Téma: ${theme}\nStílus: ${style}\nHangulat: ${mood}\n\nHasználj verses szerkezetet: [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus].\nCsak a dalszöveget add vissza.`),
        ],
        temperature: 0.9,
        max_tokens: 1200,
      };
    }
    case 'generate_structured': {
      const { referenceLyrics = '', newTheme = '' } = payload;
      return {
        model,
        messages: [
          sys('Te egy profi dalszövegíró vagy. Készíts új angol dalszöveget úgy, hogy pontosan követi a referencia dal szótagszámát soronként, a sorvégi rímek elhelyezkedését, a versszakok struktúráját ([Verse], [Chorus], [Bridge], stb.), valamint a ritmust és hangsúlyokat. Csak a dalszöveget add vissza címkékkel együtt.'),
          usr(`Referencia dalszöveg (angol):\n${referenceLyrics}\n\n---\nÚj téma: ${newTheme}\n---\n\nFeladat: Írj teljesen új angol dalszöveget az új témáról, amely FORMÁJÁBAN (szótagszám, rímképlet, szakaszok) megegyezik a referenciával, de TARTALMÁBAN az új témáról szól.`),
        ],
        temperature: 0.9,
        max_tokens: 1400,
      };
    }
    case 'translate': {
      const { lyrics = '', targetLanguage = 'Hungarian' } = payload;
      return {
        model,
        messages: [
          sys('Fordító vagy. Őrizd meg a költői hangulatot és formát.'),
          usr(`Fordítsd le a következő dalszöveget ${targetLanguage} nyelvre:\n\n${lyrics}`),
        ],
        temperature: 0.7,
        max_tokens: 1400,
      };
    }
    case 'translate_hu': {
      const { lyrics = '' } = payload;
      return {
        model,
        messages: [
          sys('Fordító vagy. Fordíts angolról természetes, költői magyarra. Tartsd meg a [Verse]/[Chorus] jelöléseket magyarul: [1. versszak], [Refrén], [Bridge].'),
          usr(`Fordítsd magyarra a következő dalszöveget:\n\n${lyrics}`),
        ],
        temperature: 0.7,
        max_tokens: 1400,
      };
    }
    case 'improve': {
      const { lyrics = '', instruction = '' } = payload;
      return {
        model,
        messages: [
          sys('Szerkesztő vagy. Finomítsd a dalszöveget a megadott instrukció szerint, őrizve a szerkezetet.'),
          usr(`Instrukció: ${instruction}\n\nDalszöveg:\n${lyrics}`),
        ],
        temperature: 0.7,
        max_tokens: 1200,
      };
    }
    case 'analyze': {
      const { lyrics = '' } = payload;
      return {
        model,
        messages: [
          sys('Elemezd a dalszöveg szerkezetét, rímképletét és szótagszámait röviden, áttekinthetően.'),
          usr(`Elemezd az alábbi dalszöveget:\n\n${lyrics}`),
        ],
        temperature: 0.2,
        max_tokens: 800,
      };
    }
    case 'optimize_prompt': {
      const { description = '', style = '', instruments = '' } = payload;
      return {
        model,
        messages: [
          sys('Generálj tömör, kifejező Suno-kompatibilis promptot angolul.'),
          usr(`Leírás: ${description}\nStílus: ${style}\nHangszerek: ${instruments}`),
        ],
        temperature: 0.7,
        max_tokens: 300,
      };
    }
    case 'shorten_prompt': {
      const { text = '' } = payload;
      return {
        model,
        messages: [
          sys('Rövidítsd a következő promptot 150 karakter körülire, a lényeg megtartásával.'),
          usr(text),
        ],
        temperature: 0.5,
        max_tokens: 120,
      };
    }
    case 'expand_prompt': {
      const { text = '' } = payload;
      return {
        model,
        messages: [
          sys('Bővítsd a promptot részletesebb, mégis tömör, hasznos jellemzőkkel.'),
          usr(text),
        ],
        temperature: 0.7,
        max_tokens: 300,
      };
    }
    case 'translate_theme_en': {
      const { hungarianTheme = '' } = payload;
      return {
        model,
        messages: [
          sys('Fordítsd a magyar témát természetes, rövid (max 20 szó) angol leírássá.'),
          usr(hungarianTheme),
        ],
        temperature: 0.3,
        max_tokens: 60,
      };
    }
    default:
      return { model, messages: [usr('Unknown action')] };
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return { error: await res.text() };
  }
}

app.listen(PORT, () => {
  console.log(`🚀 OpenAI Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/openai`);
  console.log(`⚠️  Make sure OPENAI_API_KEY is set in .env file`);
});
