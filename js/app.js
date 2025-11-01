// Suno Lyrics Manager - Main Application Logic

class SunoLyricsApp {
    constructor() {
        this.songs = this.loadSongs();
        this.currentSongId = null;
        this.currentTab = 'lyrics';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateApiStatus();
        this.renderSongsList();
        this.loadApiKeyToInput();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Tab váltás
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // API beállítások
        document.getElementById('saveApiKeyBtn')?.addEventListener('click', () => this.saveApiKey());
        document.getElementById('clearApiKeyBtn')?.addEventListener('click', () => this.clearApiKey());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.switchTab('settings'));

        // Új dal
        document.getElementById('newSongBtn')?.addEventListener('click', () => this.createNewSong());

        // Mentés és törlés
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveSong());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearEditor());

        // Lyrics funkciók
        document.getElementById('generateBtn')?.addEventListener('click', () => this.openGenerateModal());
        document.getElementById('translateBtn')?.addEventListener('click', () => this.translateLyrics());
        document.getElementById('improveBtn')?.addEventListener('click', () => this.improveLyrics());
        document.getElementById('analyzeBtn')?.addEventListener('click', () => this.analyzeLyrics());

        // Prompt funkciók
        document.getElementById('generatePromptBtn')?.addEventListener('click', () => this.generatePrompt());
        document.getElementById('optimizePromptBtn')?.addEventListener('click', () => this.optimizePrompt());
        document.getElementById('shortenPromptBtn')?.addEventListener('click', () => this.shortenPrompt());
        document.getElementById('expandPromptBtn')?.addEventListener('click', () => this.expandPrompt());
        document.getElementById('translateThemeBtn')?.addEventListener('click', () => this.translateTheme());
        document.getElementById('copyPromptBtn')?.addEventListener('click', () => this.copyPrompt());

        // Export/Import
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportSongs());
        document.getElementById('importBtn')?.addEventListener('click', () => this.importSongs());

        // Modal
        document.getElementById('confirmGenerateBtn')?.addEventListener('click', () => this.generateLyricsFromModal());
        document.getElementById('cancelGenerateBtn')?.addEventListener('click', () => this.closeGenerateModal());
    }

    // Tab váltás
    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    // API Kulcs kezelés
    saveApiKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            this.showMessage('Kérlek add meg az API kulcsot!', 'error');
            return;
        }
        
        geminiAPI.saveApiKey(apiKey);
        this.updateApiStatus();
        this.showMessage('API kulcs sikeresen mentve!', 'success');
    }

    clearApiKey() {
        if (confirm('Biztosan törölni szeretnéd az API kulcsot?')) {
            geminiAPI.clearApiKey();
            document.getElementById('apiKeyInput').value = '';
            this.updateApiStatus();
            this.showMessage('API kulcs törölve!', 'info');
        }
    }

    loadApiKeyToInput() {
        const apiKey = geminiAPI.loadApiKey();
        if (apiKey) {
            document.getElementById('apiKeyInput').value = apiKey;
        }
    }

    updateApiStatus() {
        const statusEl = document.getElementById('apiStatus');
        const hasKey = geminiAPI.hasApiKey();
        
        statusEl.classList.toggle('connected', hasKey);
        statusEl.querySelector('.status-text').textContent = 
            hasKey ? 'API: Csatlakozva' : 'API: Nincs beállítva';
    }

    // Dalok kezelése
    loadSongs() {
        const saved = localStorage.getItem('suno_songs');
        return saved ? JSON.parse(saved) : [];
    }

    saveSongs() {
        localStorage.setItem('suno_songs', JSON.stringify(this.songs));
    }

    renderSongsList() {
        const listEl = document.getElementById('songsList');
        
        if (this.songs.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px 0;">Még nincsenek dalok</p>';
            return;
        }
        
        listEl.innerHTML = this.songs.map(song => `
            <div class="song-item ${song.id === this.currentSongId ? 'active' : ''}" 
                 onclick="app.loadSong('${song.id}')">
                <div class="song-item-title">${this.escapeHtml(song.title || 'Névtelen dal')}</div>
                <div class="song-item-date">${this.formatDate(song.date)}</div>
            </div>
        `).join('');
    }

    createNewSong() {
        const newSong = {
            id: this.generateId(),
            title: '',
            lyrics: '',
            prompt: '',
            date: new Date().toISOString()
        };
        
        this.songs.unshift(newSong);
        this.currentSongId = newSong.id;
        this.saveSongs();
        this.renderSongsList();
        this.loadSongToEditor(newSong);
        this.switchTab('lyrics');
        
        document.getElementById('songTitle').focus();
    }

    loadSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;
        
        this.currentSongId = songId;
        this.renderSongsList();
        this.loadSongToEditor(song);
    }

    loadSongToEditor(song) {
        document.getElementById('songTitle').value = song.title || '';
        document.getElementById('lyricsEditor').value = song.lyrics || '';
        document.getElementById('generatedPrompt').value = song.prompt || '';
    }

    saveSong() {
        if (!this.currentSongId) {
            this.showMessage('Nincs kiválasztott dal!', 'error');
            return;
        }
        
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (!song) return;
        
        song.title = document.getElementById('songTitle').value.trim() || 'Névtelen dal';
        song.lyrics = document.getElementById('lyricsEditor').value;
        song.prompt = document.getElementById('generatedPrompt').value;
        song.date = new Date().toISOString();
        
        this.saveSongs();
        this.renderSongsList();
        this.showMessage('Dal sikeresen mentve!', 'success');
    }

    clearEditor() {
        if (confirm('Biztosan törölni szeretnéd a szerkesztő tartalmát?')) {
            document.getElementById('songTitle').value = '';
            document.getElementById('lyricsEditor').value = '';
            this.showMessage('Szerkesztő törölve!', 'info');
        }
    }

    // AI Funkciók
    async generateLyricsFromModal() {
        const theme = document.getElementById('genTheme').value.trim();
        const style = document.getElementById('genStyle').value.trim();
        const mood = document.getElementById('genMood').value.trim();
        
        if (!theme) {
            this.showMessage('Kérlek add meg a témát!', 'error');
            return;
        }
        
        this.closeGenerateModal();
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }
        
        try {
            this.showMessage('Dalszöveg generálása...', 'loading');
            const lyrics = await geminiAPI.generateLyrics(theme, style, mood);
            document.getElementById('lyricsEditor').value = lyrics;
            this.showMessage('Dalszöveg sikeresen generálva!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async translateLyrics() {
        const lyrics = document.getElementById('lyricsEditor').value.trim();
        
        if (!lyrics) {
            this.showMessage('Nincs mit fordítani!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }
        
        const targetLang = prompt('Milyen nyelvre fordítsam? (pl. Magyar, Español, Français)', 'Magyar');
        if (!targetLang) return;
        
        try {
            this.showMessage('Fordítás folyamatban...', 'loading');
            const translated = await geminiAPI.translateLyrics(lyrics, targetLang);
            document.getElementById('lyricsEditor').value = translated;
            this.showMessage('Fordítás kész!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async improveLyrics() {
        const lyrics = document.getElementById('lyricsEditor').value.trim();
        
        if (!lyrics) {
            this.showMessage('Nincs mit javítani!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }
        
        const instruction = prompt('Mit szeretnél változtatni/javítani a dalszövegen?', 'Tedd érzelemsebbé és költőibbé');
        if (!instruction) return;
        
        try {
            this.showMessage('Javítás folyamatban...', 'loading');
            const improved = await geminiAPI.improveLyrics(lyrics, instruction);
            document.getElementById('lyricsEditor').value = improved;
            this.showMessage('Javítás kész!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async analyzeLyrics() {
        const lyrics = document.getElementById('lyricsEditor').value.trim();
        
        if (!lyrics) {
            this.showMessage('Nincs mit elemezni!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }
        
        try {
            this.showMessage('Elemzés folyamatban...', 'loading');
            const analysis = await geminiAPI.analyzeLyrics(lyrics);
            alert(`Dalszöveg Elemzés:\n\n${analysis}`);
            this.showMessage('Elemzés kész!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    // Prompt Funkciók
    async generatePrompt() {
        const theme = document.getElementById('promptTheme').value.trim();
        const style = document.getElementById('promptStyle').value.trim();
        const mood = document.getElementById('promptMood').value.trim();
        const instruments = document.getElementById('promptInstruments').value.trim();
        
        if (!theme && !style) {
            this.showMessage('Add meg legalább a témát vagy a stílust!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }
        
        try {
            this.showMessage('Prompt generálása...', 'loading');
            const prompt = await geminiAPI.optimizeSunoPrompt(theme, style, instruments + ' ' + mood);
            document.getElementById('generatedPrompt').value = prompt;
            this.showMessage('Prompt sikeresen generálva!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async optimizePrompt() {
        const currentPrompt = document.getElementById('generatedPrompt').value.trim();
        
        if (!currentPrompt) {
            this.showMessage('Nincs mit optimalizálni!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            return;
        }
        
        try {
            this.showMessage('Optimalizálás...', 'loading');
            const optimized = await geminiAPI.optimizeSunoPrompt(currentPrompt, '', '');
            document.getElementById('generatedPrompt').value = optimized;
            this.showMessage('Prompt optimalizálva!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async shortenPrompt() {
        const currentPrompt = document.getElementById('generatedPrompt').value.trim();
        
        if (!currentPrompt) {
            this.showMessage('Nincs mit rövidíteni!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            return;
        }
        
        try {
            this.showMessage('Rövidítés...', 'loading');
            const shortened = await geminiAPI.shortenPrompt(currentPrompt);
            document.getElementById('generatedPrompt').value = shortened;
            this.showMessage('Prompt rövidítve!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async expandPrompt() {
        const currentPrompt = document.getElementById('generatedPrompt').value.trim();
        
        if (!currentPrompt) {
            this.showMessage('Nincs mit bővíteni!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            return;
        }
        
        try {
            this.showMessage('Bővítés...', 'loading');
            const expanded = await geminiAPI.expandPrompt(currentPrompt);
            document.getElementById('generatedPrompt').value = expanded;
            this.showMessage('Prompt bővítve!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    async translateTheme() {
        const huTheme = document.getElementById('promptTheme').value.trim();
        
        if (!huTheme) {
            this.showMessage('Nincs mit fordítani!', 'error');
            return;
        }
        
        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            return;
        }
        
        try {
            this.showMessage('Fordítás...', 'loading');
            const enTheme = await geminiAPI.translateThemeToEnglish(huTheme);
            document.getElementById('promptTheme').value = enTheme;
            this.showMessage('Téma angolra fordítva!', 'success');
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
        }
    }

    copyPrompt() {
        const prompt = document.getElementById('generatedPrompt').value;
        
        if (!prompt) {
            this.showMessage('Nincs mit másolni!', 'error');
            return;
        }
        
        navigator.clipboard.writeText(prompt).then(() => {
            this.showMessage('Prompt vágólapra másolva!', 'success');
        }).catch(() => {
            this.showMessage('Másolás sikertelen!', 'error');
        });
    }

    // Export/Import
    exportSongs() {
        if (this.songs.length === 0) {
            this.showMessage('Nincsenek exportálható dalok!', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(this.songs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `suno-lyrics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Dalok exportálva!', 'success');
    }

    importSongs() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedSongs = JSON.parse(event.target.result);
                    
                    if (!Array.isArray(importedSongs)) {
                        throw new Error('Érvénytelen fájl formátum');
                    }
                    
                    if (confirm(`${importedSongs.length} dal importálása?`)) {
                        this.songs = [...importedSongs, ...this.songs];
                        this.saveSongs();
                        this.renderSongsList();
                        this.showMessage('Dalok sikeresen importálva!', 'success');
                    }
                } catch (error) {
                    this.showMessage(`Hiba az importálás során: ${error.message}`, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Modal kezelés
    openGenerateModal() {
        document.getElementById('generateModal').style.display = 'flex';
    }

    closeGenerateModal() {
        document.getElementById('generateModal').style.display = 'none';
    }

    // Utility funkciók
    generateId() {
        return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Ma';
        if (diffDays === 1) return 'Tegnap';
        if (diffDays < 7) return `${diffDays} napja`;
        
        return date.toLocaleDateString('hu-HU');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Egyszerű alert megoldás - később cserélhető toast notification-re
        if (type === 'loading') {
            console.log('⏳', message);
        } else if (type === 'success') {
            console.log('✅', message);
        } else if (type === 'error') {
            console.error('❌', message);
            alert(message);
        } else {
            console.log('ℹ️', message);
        }
    }
}

// Alkalmazás inicializálása
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SunoLyricsApp();
});
