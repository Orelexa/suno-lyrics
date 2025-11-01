// Suno Lyrics SKILL - Application Logic

class SunoSkillApp {
    constructor() {
        this.currentOutputTab = 'english';
        this.generatedLyrics = {
            english: '',
            hungarian: ''
        };
        
        this.init();
    }

    init() {
        this.checkApiKey();
        this.loadApiKeyToInput();
    }

    // ========================================================================
    // API KULCS KEZELÉS
    // ========================================================================

    checkApiKey() {
        const hasGeminiKey = geminiAPI.hasApiKey();
        const hasChatGptKey = geminiAPI.hasChatGptApiKey();
        const apiSetup = document.getElementById('apiSetup');
        const mainContent = document.getElementById('mainContent');
        const apiStatusText = document.getElementById('apiStatusText');

        if (hasGeminiKey && hasChatGptKey) {
            apiSetup.style.display = 'none';
            mainContent.style.display = 'block';
            apiStatusText.textContent = 'API: Mindkettő beállítva ✓';
            apiStatusText.style.color = '#4ade80';
        } else if (hasGeminiKey) {
            apiSetup.style.display = 'none';
            mainContent.style.display = 'block';
            apiStatusText.textContent = 'API: Gemini ✓, ChatGPT ✗';
            apiStatusText.style.color = '#ff832b';
        } else {
            apiSetup.style.display = 'block';
            mainContent.style.display = 'none';
            apiStatusText.textContent = 'API: Nincs beállítva';
            apiStatusText.style.color = '#94a3b8';
        }
    }

    loadApiKeyToInput() {
        const geminiKey = geminiAPI.loadApiKey();
        const chatGptKey = geminiAPI.loadChatGptApiKey();
        
        if (geminiKey) {
            document.getElementById('apiKeyInput').value = geminiKey;
        }
        if (chatGptKey) {
            document.getElementById('chatgptApiKeyInput').value = chatGptKey;
        }
    }

    saveApiKeys() {
        const geminiKey = document.getElementById('apiKeyInput').value.trim();
        const chatGptKey = document.getElementById('chatgptApiKeyInput').value.trim();
        
        if (!geminiKey) {
            this.showToast('Kérlek add meg a Gemini API kulcsot!', 'error');
            return;
        }
        
        if (!chatGptKey) {
            this.showToast('Kérlek add meg a ChatGPT API kulcsot is!', 'error');
            return;
        }
        
        if (geminiKey.length < 20) {
            this.showToast('A Gemini API kulcs túl rövid. Ellenőrizd!', 'error');
            return;
        }

        if (chatGptKey.length < 20) {
            this.showToast('A ChatGPT API kulcs túl rövid. Ellenőrizd!', 'error');
            return;
        }
        
        geminiAPI.saveApiKey(geminiKey);
        geminiAPI.saveChatGptApiKey(chatGptKey);
        this.showToast('Mindkét API kulcs sikeresen mentve!', 'success');
        this.checkApiKey();
    }

    // ========================================================================
    // FŐ FUNKCIÓ: STRUKTURÁLT LYRICS GENERÁLÁS
    // ========================================================================

    async generateStructuredLyrics() {
        const referenceLyrics = document.getElementById('referenceLyrics').value.trim();
        const newTheme = document.getElementById('newTheme').value.trim();

        // Validáció
        if (!referenceLyrics) {
            this.showToast('Kérlek add meg a referencia dalszöveget!', 'error');
            return;
        }

        if (!newTheme) {
            this.showToast('Kérlek add meg az új témát!', 'error');
            return;
        }

        // API kulcsok ellenőrzése
        if (!geminiAPI.hasApiKey()) {
            this.showToast('Gemini API kulcs nincs beállítva!', 'error');
            this.checkApiKey();
            return;
        }

        if (!geminiAPI.hasChatGptApiKey()) {
            this.showToast('ChatGPT API kulcs nincs beállítva a fordításhoz!', 'error');
            this.checkApiKey();
            return;
        }

        // Loading állapot
        this.showLoading('Dalszöveg generálása folyamatban...');

        try {
            // Generálás
            const result = await geminiAPI.generateStructuredLyrics(referenceLyrics, newTheme);
            
            // Eredmény megjelenítése
            this.generatedLyrics.english = result.english;
            this.generatedLyrics.hungarian = result.hungarian;
            
            document.getElementById('englishLyrics').value = result.english;
            document.getElementById('hungarianLyrics').value = result.hungarian;
            
            this.hideLoading();
            this.showToast('Dalszöveg sikeresen generálva!', 'success');
            
            // Automatikusan vált angol tab-ra
            this.switchOutputTab('english');

        } catch (error) {
            this.hideLoading();
            console.error('Hiba a generálás során:', error);
            this.showToast('Hiba történt: ' + error.message, 'error');
        }
    }

    // ========================================================================
    // REFERENCIA ELEMZÉS
    // ========================================================================

    async analyzeReference() {
        const referenceLyrics = document.getElementById('referenceLyrics').value.trim();

        if (!referenceLyrics) {
            this.showToast('Kérlek add meg a referencia dalszöveget!', 'error');
            return;
        }

        if (!geminiAPI.hasApiKey()) {
            this.showToast('API kulcs nincs beállítva!', 'error');
            return;
        }

        this.showLoading('Referencia elemzése...');

        try {
            const analysis = await geminiAPI.analyzeLyricsStructure(referenceLyrics);
            
            const analysisSection = document.getElementById('analysisSection');
            const analysisContent = document.getElementById('analysisContent');
            
            analysisContent.innerHTML = '<pre>' + analysis + '</pre>';
            analysisSection.style.display = 'block';
            
            this.hideLoading();
            this.showToast('Elemzés kész!', 'success');

        } catch (error) {
            this.hideLoading();
            console.error('Elemzési hiba:', error);
            this.showToast('Hiba történt: ' + error.message, 'error');
        }
    }

    closeAnalysis() {
        document.getElementById('analysisSection').style.display = 'none';
    }

    // ========================================================================
    // OUTPUT TAB VÁLTÁS
    // ========================================================================

    switchOutputTab(tab) {
        this.currentOutputTab = tab;

        // Tab gombok
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Output területek
        document.getElementById('englishOutput').style.display = tab === 'english' ? 'block' : 'none';
        document.getElementById('hungarianOutput').style.display = tab === 'hungarian' ? 'block' : 'none';
    }

    // ========================================================================
    // VÁGÓLAPRA MÁSOLÁS
    // ========================================================================

    async copyToClipboard(type) {
        const text = type === 'english' 
            ? document.getElementById('englishLyrics').value 
            : document.getElementById('hungarianLyrics').value;

        if (!text) {
            this.showToast('Nincs mit másolni!', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Vágólapra másolva!', 'success');
        } catch (error) {
            // Fallback régebbi böngészőkhöz
            const textarea = type === 'english' 
                ? document.getElementById('englishLyrics')
                : document.getElementById('hungarianLyrics');
            textarea.select();
            document.execCommand('copy');
            this.showToast('Vágólapra másolva!', 'success');
        }
    }

    // ========================================================================
    // FÁJLBA MENTÉS
    // ========================================================================

    saveAsFile() {
        const english = this.generatedLyrics.english;
        const hungarian = this.generatedLyrics.hungarian;

        if (!english) {
            this.showToast('Nincs generált dalszöveg!', 'error');
            return;
        }

        const content = `===========================================
🎵 SUNO LYRICS - GENERATED
===========================================

📅 Dátum: ${new Date().toLocaleString('hu-HU')}
📝 Referencia téma: ${document.getElementById('newTheme').value}

===========================================
🇬🇧 ANGOL VERZIÓ
===========================================

${english}

===========================================
🇭🇺 MAGYAR FORDÍTÁS
===========================================

${hungarian}

===========================================
Generated by Suno Lyrics SKILL
===========================================`;

        this.downloadFile(content, 'suno-lyrics-' + Date.now() + '.txt');
        this.showToast('Fájl letöltve!', 'success');
    }

    exportBoth() {
        const english = this.generatedLyrics.english;
        const hungarian = this.generatedLyrics.hungarian;

        if (!english) {
            this.showToast('Nincs generált dalszöveg!', 'error');
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            theme: document.getElementById('newTheme').value,
            reference: document.getElementById('referenceLyrics').value,
            generated: {
                english: english,
                hungarian: hungarian
            }
        };

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'suno-lyrics-' + Date.now() + '.json');
        this.showToast('JSON exportálva!', 'success');
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ========================================================================
    // TÖRLÉS
    // ========================================================================

    clearAll() {
        if (!confirm('Biztosan törölni szeretnéd az összes mezőt?')) {
            return;
        }

        document.getElementById('referenceLyrics').value = '';
        document.getElementById('newTheme').value = '';
        document.getElementById('englishLyrics').value = '';
        document.getElementById('hungarianLyrics').value = '';
        
        this.generatedLyrics = { english: '', hungarian: '' };
        
        this.showToast('Minden mező törölve!', 'info');
    }

    // ========================================================================
    // UI SEGÉDFUNKCIÓK
    // ========================================================================

    showLoading(message = 'Betöltés...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');
        text.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// App indítása
const app = new SunoSkillApp();
