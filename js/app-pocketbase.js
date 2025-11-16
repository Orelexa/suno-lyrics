// Suno Lyrics Manager - Main Application Logic with PocketBase
import pocketbase from './pocketbase.js';

class SunoLyricsApp {
    constructor() {
        this.songs = [];
        this.currentSongId = null;
        this.currentTab = 'lyrics';
        this.isAuthenticated = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateApiStatus();

        // Check auth status
        this.isAuthenticated = pocketbase.isAuthenticated();
        this.updateAuthUI();

        if (this.isAuthenticated) {
            await this.loadSongsFromPocketBase();
            this.renderSongsList();
            this.checkForMigration();
        }

        this.loadApiKeyToInput();

        // Listen for auth changes
        window.addEventListener('pocketbase-auth-change', (e) => {
            this.isAuthenticated = e.detail.isAuthenticated;
            this.updateAuthUI();
            if (this.isAuthenticated) {
                this.loadSongsFromPocketBase();
            } else {
                this.songs = [];
                this.currentSongId = null;
                this.renderSongsList();
            }
        });
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

        // Auth
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Auth modal tabs
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.authTab));
        });

        // Auth actions
        document.getElementById('confirmLoginBtn')?.addEventListener('click', () => this.login());
        document.getElementById('confirmRegisterBtn')?.addEventListener('click', () => this.register());
        document.getElementById('cancelAuthBtn')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('cancelRegisterBtn')?.addEventListener('click', () => this.closeAuthModal());

        // Migration
        document.getElementById('confirmMigrationBtn')?.addEventListener('click', () => this.performMigration());
        document.getElementById('skipMigrationBtn')?.addEventListener('click', () => this.closeMigrationModal());

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

        // Dal lista kattintás (delegált)
        document.getElementById('songsList')?.addEventListener('click', (e) => {
            const del = e.target.closest('.song-delete');
            if (del && del.dataset && del.dataset.id) {
                e.preventDefault();
                e.stopPropagation();
                this.deleteSongById(del.dataset.id);
                return;
            }
            const item = e.target.closest('.song-item');
            if (item && item.dataset && item.dataset.id) {
                this.loadSong(item.dataset.id);
                this.switchTab('lyrics');
            }
        });

        // Másolás gombok
        document.getElementById('copyLyricsBtn')?.addEventListener('click', () => this.copyById('lyricsEditor'));
        document.getElementById('copySkillEnglishBtn')?.addEventListener('click', () => this.copyById('skillEnglish'));
        document.getElementById('copySkillHungarianBtn')?.addEventListener('click', () => this.copyById('skillHungarian'));

        // SKILL panel
        document.getElementById('skillGenerateBtn')?.addEventListener('click', () => this.skillGenerate());


        // Modal
        document.getElementById('confirmGenerateBtn')?.addEventListener('click', () => this.generateLyricsFromModal());
        document.getElementById('cancelGenerateBtn')?.addEventListener('click', () => this.closeGenerateModal());
    }

    // Auth UI
    updateAuthUI(retryCount = 0) {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated) {
            const user = pocketbase.getCurrentUser();

            // Check if user data is available
            if (user) {
                loginBtn.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = user.username || user.email || 'Felhasználó';
                console.log('👤 User displayed:', userName.textContent);
            } else {
                console.warn(`⚠️ User authenticated but user data not yet available (retry ${retryCount}/10)`);
                // Retry up to 10 times (1 second total)
                if (retryCount < 10) {
                    setTimeout(() => this.updateAuthUI(retryCount + 1), 100);
                } else {
                    console.error('❌ Failed to load user data after 10 retries. Forcing logout.');
                    this.isAuthenticated = false;
                    loginBtn.style.display = 'block';
                    userInfo.style.display = 'none';
                }
            }
        } else {
            loginBtn.style.display = 'block';
            userInfo.style.display = 'none';
        }
    }

    openAuthModal(mode = 'login') {
        document.getElementById('authModal').style.display = 'flex';
        this.switchAuthTab(mode);
    }

    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.authTab === tab);
        });

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });

        document.getElementById('authModalTitle').textContent =
            tab === 'login' ? 'Bejelentkezés' : 'Regisztráció';
    }

    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Kérlek töltsd ki az összes mezőt!', 'error');
            return;
        }

        try {
            showOverlay('Bejelentkezés...');
            const authData = await pocketbase.login(email, password);

            console.log('✅ Login successful, auth data:', authData);

            // IMPORTANT: Update auth state immediately after login
            this.isAuthenticated = true;
            console.log('✅ isAuthenticated set to:', this.isAuthenticated);
            console.log('🔐 PocketBase auth status:', pocketbase.isAuthenticated());
            console.log('👤 Current user:', pocketbase.getCurrentUser());

            // Update UI after auth data is available
            this.updateAuthUI();

            this.closeAuthModal();
            this.showMessage('Sikeres bejelentkezés!', 'success');

            // Wait longer to ensure authStore is fully updated
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log('📚 Loading songs after login...');
            console.log('🔐 Final auth check before loading songs:');
            console.log('  - App isAuthenticated:', this.isAuthenticated);
            console.log('  - PocketBase isAuthenticated:', pocketbase.isAuthenticated());
            console.log('  - PocketBase user:', pocketbase.getCurrentUser());

            await this.loadSongsFromPocketBase();
            this.renderSongsList();
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    async register() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (!username || !email || !password || !passwordConfirm) {
            this.showMessage('Kérlek töltsd ki az összes mezőt!', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showMessage('A jelszavak nem egyeznek!', 'error');
            return;
        }

        if (password.length < 8) {
            this.showMessage('A jelszónak legalább 8 karakter hosszúnak kell lennie!', 'error');
            return;
        }

        try {
            showOverlay('Regisztráció...');
            await pocketbase.register(email, password, username);
            this.showMessage('Sikeres regisztráció! Most jelentkezz be.', 'success');
            this.switchAuthTab('login');
            document.getElementById('loginEmail').value = email;
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    logout() {
        if (confirm('Biztosan kijelentkezel?')) {
            pocketbase.logout();

            // Update auth state immediately
            this.isAuthenticated = false;
            this.updateAuthUI();

            this.songs = [];
            this.currentSongId = null;
            this.renderSongsList();
            this.clearEditor();
            this.showMessage('Kijelentkezve!', 'info');
        }
    }

    // Migration
    checkForMigration() {
        const localSongs = localStorage.getItem('suno_songs');
        if (localSongs) {
            const songs = JSON.parse(localSongs);
            if (songs.length > 0) {
                document.getElementById('migrationSongCount').textContent =
                    `${songs.length} dal található a LocalStorage-ben.`;
                document.getElementById('migrationModal').style.display = 'flex';
            }
        }
    }

    async performMigration() {
        try {
            showOverlay('Dalok importálása...');
            const result = await pocketbase.migrateSongsFromLocalStorage();
            this.closeMigrationModal();
            this.showMessage(`${result.count} dal sikeresen importálva!`, 'success');

            // Backup and clear localStorage
            const backup = localStorage.getItem('suno_songs');
            localStorage.setItem('suno_songs_backup', backup);
            localStorage.removeItem('suno_songs');

            await this.loadSongsFromPocketBase();
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    closeMigrationModal() {
        document.getElementById('migrationModal').style.display = 'none';
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

    // Dalok kezelése - PocketBase
    async loadSongsFromPocketBase() {
        console.log('📚 loadSongsFromPocketBase called, isAuthenticated:', this.isAuthenticated);

        if (!this.isAuthenticated) {
            console.warn('⚠️ loadSongsFromPocketBase skipped: not authenticated');
            return;
        }

        try {
            const records = await pocketbase.getSongs();
            this.songs = records.map(r => ({
                id: r.id,
                title: r.title,
                lyrics: r.lyrics,
                prompt: r.prompt,
                date: r.created
            }));
            console.log('✅ Songs mapped:', this.songs.length);
            this.renderSongsList();
        } catch (error) {
            console.error('❌ Error loading songs:', error);
            // Don't show error if it's just empty collection
            if (!error.message.includes('404')) {
                this.showMessage('Hiba a dalok betöltésekor: ' + error.message, 'error');
            }
        }
    }

    renderSongsList() {
        const listEl = document.getElementById('songsList');

        if (!this.isAuthenticated) {
            listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px 0;">Jelentkezz be a dalok megtekintéséhez</p>';
            return;
        }

        if (this.songs.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px 0;">Még nincsenek dalok</p>';
            return;
        }

        listEl.innerHTML = this.songs.map(song => `
            <div class="song-item ${song.id === this.currentSongId ? 'active' : ''}" data-id="${song.id}">
                <div class="song-item-title">${this.escapeHtml(song.title || 'Névtelen dal')}</div>
                <div class="song-item-date">${this.formatDate(song.date)}</div>
                <button class="song-delete" data-id="${song.id}" title="Dal törlése" aria-label="Dal törlése">🗑️</button>
            </div>
        `).join('');
    }

    async createNewSong() {
        if (!this.isAuthenticated) {
            this.showMessage('Jelentkezz be új dal létrehozásához!', 'error');
            this.openAuthModal('login');
            return;
        }

        try {
            showOverlay('Dal létrehozása...');
            const newSong = await pocketbase.createSong({
                title: 'Új dal',
                lyrics: '',
                prompt: ''
            });

            this.songs.unshift({
                id: newSong.id,
                title: newSong.title,
                lyrics: newSong.lyrics,
                prompt: newSong.prompt,
                date: newSong.created
            });

            this.currentSongId = newSong.id;
            this.renderSongsList();
            this.loadSongToEditor(this.songs[0]);
            this.switchTab('lyrics');

            document.getElementById('songTitle').focus();
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    loadSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        this.currentSongId = songId;
        this.renderSongsList();
        this.loadSongToEditor(song);
        this.switchTab('lyrics');
    }

    loadSongToEditor(song) {
        document.getElementById('songTitle').value = song.title || '';
        document.getElementById('lyricsEditor').value = song.lyrics || '';
        document.getElementById('generatedPrompt').value = song.prompt || '';
    }

    async saveSong() {
        console.log('═══════════════════════════════════════════');
        console.log('💾 saveSong called');
        console.log('  - isAuthenticated:', this.isAuthenticated);
        console.log('  - currentSongId:', this.currentSongId);
        console.log('  - Number of songs in list:', this.songs.length);
        console.log('═══════════════════════════════════════════');

        if (!this.isAuthenticated) {
            this.showMessage('Nem vagy bejelentkezve!', 'error');
            console.error('❌ Save blocked: not authenticated');
            return;
        }

        const newTitle = document.getElementById('songTitle').value.trim() || 'Névtelen dal';
        const newLyrics = document.getElementById('lyricsEditor').value;
        const newPrompt = document.getElementById('generatedPrompt').value;

        console.log('📄 Save data:');
        console.log('  - Title:', newTitle);
        console.log('  - Lyrics length:', newLyrics.length);
        console.log('  - Prompt length:', newPrompt.length);

        // If no current song, create a new one
        if (!this.currentSongId) {
            console.log('🆕 currentSongId is NULL → Creating NEW song...');
            try {
                showOverlay('Új dal létrehozása...');
                const newSong = await pocketbase.createSong({
                    title: newTitle,
                    lyrics: newLyrics,
                    prompt: newPrompt
                });

                console.log('✅ NEW song created with ID:', newSong.id);

                this.songs.unshift({
                    id: newSong.id,
                    title: newSong.title,
                    lyrics: newSong.lyrics,
                    prompt: newSong.prompt,
                    date: newSong.created
                });

                this.currentSongId = newSong.id;
                console.log('✅ currentSongId set to:', this.currentSongId);

                this.renderSongsList();
                this.showMessage('✅ ÚJ dal sikeresen létrehozva!', 'success');
                hideOverlay();
                return;
            } catch (error) {
                console.error('❌ Error creating song:', error);
                this.showMessage('Hiba a dal létrehozásakor: ' + error.message, 'error');
                hideOverlay();
                return;
            }
        }

        // Update existing song
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (!song) {
            console.error('❌ Song not found in local array:', this.currentSongId);
            this.showMessage('Dal nem található!', 'error');
            return;
        }

        console.log('📝 Updating existing song:', this.currentSongId);

        try {
            showOverlay('Mentés...');
            await pocketbase.updateSong(this.currentSongId, {
                title: newTitle,
                lyrics: newLyrics,
                prompt: newPrompt
            });

            song.title = newTitle;
            song.lyrics = newLyrics;
            song.prompt = newPrompt;
            song.date = new Date().toISOString();

            this.renderSongsList();
            this.showMessage('Dal sikeresen mentve!', 'success');
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    async deleteSongById(songId) {
        if (!confirm('Biztosan törlöd ezt a dalt?')) return;

        try {
            showOverlay('Törlés...');
            await pocketbase.deleteSong(songId);

            const idx = this.songs.findIndex(s => s.id === songId);
            if (idx !== -1) {
                this.songs.splice(idx, 1);
            }

            if (this.currentSongId === songId) {
                if (this.songs.length > 0) {
                    const next = this.songs[Math.min(idx, this.songs.length - 1)];
                    this.currentSongId = next.id;
                    this.loadSongToEditor(next);
                } else {
                    this.currentSongId = null;
                    document.getElementById('songTitle').value = '';
                    document.getElementById('lyricsEditor').value = '';
                    document.getElementById('generatedPrompt').value = '';
                }
            }

            this.renderSongsList();
            this.showMessage('Dal törölve!', 'success');
            hideOverlay();
        } catch (error) {
            this.showMessage(error.message, 'error');
            hideOverlay();
        }
    }

    clearEditor() {
        if (confirm('Biztosan törölni szeretnéd a szerkesztő tartalmát?')) {
            document.getElementById('songTitle').value = '';
            document.getElementById('lyricsEditor').value = '';
            document.getElementById('generatedPrompt').value = '';

            // Clear current song selection
            this.currentSongId = null;
            console.log('🧹 Editor cleared, currentSongId nulled');

            // Update UI - deselect all songs
            this.renderSongsList();

            this.showMessage('Szerkesztő törölve!', 'info');
        }
    }

    // AI Funkciók (same as original)
    async generateLyricsFromModal() {
        const theme = document.getElementById('genTheme').value.trim();
        const style = document.getElementById('genStyle').value.trim();
        const mood = document.getElementById('genMood').value.trim();

        if (!theme) {
            this.showMessage('Kérlek add meg a témát!', 'error');
            return;
        }

        console.log('🎵 Generation started, currentSongId BEFORE clear:', this.currentSongId);

        this.closeGenerateModal();

        if (!geminiAPI.hasApiKey()) {
            this.showMessage('API kulcs nincs beállítva!', 'error');
            this.switchTab('settings');
            return;
        }

        try {
            this.showMessage('Dalszöveg generálása...', 'loading');
            showOverlay('Dalszöveg generálása...');
            const lyrics = await geminiAPI.generateLyrics(theme, style, mood);

            // CRITICAL: Clear current song selection FIRST - new generated content should create new song
            const previousSongId = this.currentSongId;
            this.currentSongId = null;
            console.log('🆕 Generated new lyrics!');
            console.log('  - Previous currentSongId:', previousSongId);
            console.log('  - NEW currentSongId:', this.currentSongId);

            // Clear song title and prompt for new song
            document.getElementById('songTitle').value = ''; // Empty title signals NEW song
            document.getElementById('lyricsEditor').value = lyrics;
            document.getElementById('generatedPrompt').value = ''; // Clear prompt too

            // Update UI - deselect all songs in the list
            this.renderSongsList();

            this.showMessage('✨ ÚJ dalszöveg generálva! Add meg a címét és mentsd el ÚJ dalként.', 'success');
            hideOverlay();
        } catch (error) {
            this.showMessage(`Hiba: ${error.message}`, 'error');
            hideOverlay();
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

    // Universal copy function with HTTP fallback
    async copyToClipboard(text) {
        if (!text) {
            this.showMessage('Nincs mit másolni!', 'error');
            return false;
        }

        // Try modern clipboard API first (works on HTTPS and localhost)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                this.showMessage('Vágólapra másolva!', 'success');
                return true;
            } catch (err) {
                console.log('Clipboard API failed, trying fallback...', err);
            }
        }

        // Fallback for HTTP: use old-school textarea method
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (successful) {
                this.showMessage('Vágólapra másolva!', 'success');
                return true;
            } else {
                throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            this.showMessage('Másolás sikertelen! Másolj kézzel (Ctrl+C)', 'error');
            return false;
        }
    }

    copyPrompt() {
        const prompt = document.getElementById('generatedPrompt').value;
        this.copyToClipboard(prompt);
    }

    copyById(elementId) {
        const el = document.getElementById(elementId);
        const text = el?.value?.trim() || '';
        this.copyToClipboard(text);
    }

    // Modal kezelés
    openGenerateModal() {
        document.getElementById('generateModal').style.display = 'flex';
    }

    closeGenerateModal() {
        document.getElementById('generateModal').style.display = 'none';
    }

    // Utility funkciók
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

// SKILL: Strukturált dalszöveg generálás
SunoLyricsApp.prototype.skillGenerate = async function () {
    const referenceEl = document.getElementById('skillReference');
    const themeEl = document.getElementById('skillTheme');
    const englishEl = document.getElementById('skillEnglish');
    const hungarianEl = document.getElementById('skillHungarian');

    const reference = referenceEl ? referenceEl.value.trim() : '';
    const theme = themeEl ? themeEl.value.trim() : '';

    if (!reference) {
        this.showMessage('Kérlek add meg a referencia dalszöveget!', 'error');
        return;
    }
    if (!theme) {
        this.showMessage('Kérlek add meg a témát!', 'error');
        return;
    }

    try {
        this.showMessage('Strukturált generálás folyamatban...', 'loading');
        showOverlay('Strukturált generálás...');
        const result = await geminiAPI.generateStructuredLyrics(reference, theme);
        if (englishEl) englishEl.value = (result?.english || '').trim();
        if (hungarianEl) hungarianEl.value = (result?.hungarian || '').trim();
        this.showMessage('Dalszöveg sikeresen generálva!', 'success');
        hideOverlay();
    } catch (error) {
        console.error(error);
        this.showMessage(`Hiba: ${error.message}`, 'error');
        hideOverlay();
    }
};

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SunoLyricsApp();
});

// Global loading helpers
function showOverlay(message) {
    const ov = document.getElementById('loadingOverlay');
    const txt = document.getElementById('loadingText');
    if (txt && message) txt.textContent = message;
    if (ov) ov.style.display = 'flex';
}

function hideOverlay() {
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}
