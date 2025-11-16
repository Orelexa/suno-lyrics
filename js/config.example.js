// OpenAI API Configuration
// FIGYELEM: Ez ideiglenes megoldás teszteléshez!
// Production környezetben használj backend szervert!

// TELEPÍTÉS:
// 1. Másold át ezt a fájlt config.js névre: cp config.example.js config.js
// 2. Állítsd be az API kulcsot a config.js fájlban
// 3. NE kommitold a config.js fájlt!

const CONFIG = {
  OPENAI_API_KEY: 'sk-proj-xxxx...',  // IDE ÍRD BE A TELJES API KULCSOT!
  USE_BACKEND: false  // true = backend szerver használata (biztonságos), false = közvetlen API hívás (csak teszteléshez!)
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
