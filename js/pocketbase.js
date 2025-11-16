// PocketBase Integration for Suno Lyrics Manager
// PocketBase URL: http://192.168.1.122:8090

import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.es.mjs';

class PocketBaseClient {
    constructor() {
        this.pb = new PocketBase('http://192.168.1.122:8090');
        this.pb.autoCancellation(false);

        // Manual auth state (since authStore doesn't work reliably)
        this.authToken = null;
        this.authUser = null;

        console.log('🔧 PocketBase initialized');
        console.log('📦 AuthStore initial state:', {
            token: this.pb.authStore.token,
            isValid: this.pb.authStore.isValid,
            model: this.pb.authStore.model
        });

        // Listen for auth changes
        this.pb.authStore.onChange(() => {
            console.log('🔔 AuthStore changed:', this.pb.authStore.isValid);
            this.onAuthChange();
        });
    }

    // Auth Methods
    async register(email, password, username) {
        try {
            const data = {
                email: email,
                password: password,
                passwordConfirm: password,
                username: username,
                emailVisibility: true
            };

            console.log('Attempting to register user with data:', { email, username });
            const user = await this.pb.collection('users').create(data);
            console.log('User created successfully:', user);

            // Try to send verification email (optional - don't fail if it doesn't work)
            try {
                await this.pb.collection('users').requestVerification(email);
                console.log('Verification email sent');
            } catch (verifyError) {
                console.warn('Could not send verification email (this is OK):', verifyError);
            }

            return user;
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Full error details:', error.data);

            // More detailed error messages
            if (error.data?.data) {
                const errorFields = Object.keys(error.data.data);
                const errorMessages = errorFields.map(field => {
                    const fieldError = error.data.data[field];

                    // Friendly error messages
                    if (field === 'email' && fieldError.message.includes('unique')) {
                        return 'Ez az email cím már regisztrálva van. Próbálj bejelentkezni vagy használj másik email címet.';
                    }
                    if (field === 'username' && fieldError.message.includes('unique')) {
                        return 'Ez a felhasználónév már foglalt. Válassz másikat.';
                    }

                    return `${field}: ${fieldError.message}`;
                }).join('\n');
                throw new Error(errorMessages);
            }

            throw new Error(error.message || 'Regisztráció sikertelen. Ellenőrizd a PocketBase beállításokat.');
        }
    }

    async login(email, password) {
        try {
            const authData = await this.pb.collection('users').authWithPassword(email, password);

            console.log('🔑 Auth data received:', authData);
            console.log('📦 AuthStore token:', this.pb.authStore.token);
            console.log('✅ AuthStore isValid:', this.pb.authStore.isValid);
            console.log('👤 AuthStore model:', this.pb.authStore.model);

            // Save to manual auth state (WORKAROUND for broken authStore)
            this.authToken = authData.token;
            this.authUser = authData.record;
            console.log('💾 Saved to manual auth state');

            // Try to fix authStore
            if (!this.pb.authStore.isValid) {
                console.error('❌ WARNING: authStore.isValid is false after login!');

                try {
                    // Try different methods to save
                    this.pb.authStore.save(authData.token, authData.record);
                    console.log('🔧 Attempt 1 - save() result:', this.pb.authStore.isValid);

                    if (!this.pb.authStore.isValid) {
                        // Try setting token directly
                        this.pb.authStore.token = authData.token;
                        this.pb.authStore.model = authData.record;
                        console.log('🔧 Attempt 2 - direct assignment result:', this.pb.authStore.isValid);
                    }

                    if (!this.pb.authStore.isValid) {
                        console.error('❌ CRITICAL: authStore refuses to save! Using manual auth state instead.');
                    }
                } catch (e) {
                    console.error('❌ Error saving to authStore:', e);
                }
            } else {
                console.log('✅ AuthStore working correctly!');
            }

            return authData;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Bejelentkezés sikertelen. Ellenőrizd az email címet és jelszót.');
        }
    }

    logout() {
        this.pb.authStore.clear();
        // Clear manual auth state too
        this.authToken = null;
        this.authUser = null;
    }

    isAuthenticated() {
        // Use manual auth state as fallback
        const authStoreValid = this.pb.authStore.isValid;
        const manualAuthValid = !!(this.authToken && this.authUser);

        console.log('🔐 isAuthenticated check:', {
            authStore: authStoreValid,
            manual: manualAuthValid,
            result: authStoreValid || manualAuthValid
        });

        return authStoreValid || manualAuthValid;
    }

    getCurrentUser() {
        // Use manual auth state as fallback
        const user = this.pb.authStore.model || this.authUser;

        if (!user) {
            console.warn('⚠️ getCurrentUser: No user found in authStore or manual state');
        }

        return user;
    }

    getAuthToken() {
        return this.pb.authStore.token || this.authToken;
    }

    onAuthChange() {
        // Trigger custom event for app to listen to
        window.dispatchEvent(new CustomEvent('pocketbase-auth-change', {
            detail: {
                isAuthenticated: this.isAuthenticated(),
                user: this.getCurrentUser()
            }
        }));
    }

    // Songs Collection Methods
    async getSongs() {
        console.log('📚 getSongs called');
        console.log('🔐 Auth valid:', this.isAuthenticated());
        console.log('👤 Current user:', this.getCurrentUser());
        console.log('🔑 Auth token:', this.getAuthToken() ? 'present' : 'missing');

        if (!this.isAuthenticated()) {
            console.error('❌ getSongs: Not authenticated!');
            console.error('  - authStore.isValid:', this.pb.authStore.isValid);
            console.error('  - manual auth:', !!(this.authToken && this.authUser));
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const user = this.getCurrentUser();
            if (!user || !user.id) {
                console.error('❌ getSongs: User object invalid:', user);
                throw new Error('Felhasználói adatok nem elérhetők');
            }

            const userId = user.id;
            const token = this.getAuthToken();
            console.log('📥 Fetching songs for user:', userId);

            // Use manual fetch with auth header if authStore doesn't work
            if (!this.pb.authStore.isValid && token) {
                console.log('🔧 Using manual fetch with auth token');
                const response = await fetch(`http://192.168.1.122:8090/api/collections/songs/records?filter=(user="${userId}")&sort=-created`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('✅ Songs loaded (manual fetch):', data.items.length);
                return data.items;
            }

            // Use PocketBase SDK if authStore works
            const records = await this.pb.collection('songs').getFullList({
                filter: `user = "${userId}"`,
                sort: '-created',
            });

            console.log('✅ Songs loaded:', records.length);
            return records;
        } catch (error) {
            console.error('❌ Error fetching songs:', error);

            if (error.status === 404 || error.message?.includes('404')) {
                // Songs collection doesn't exist or is empty
                console.warn('Songs collection might not exist yet');
                return [];
            }

            throw new Error('Dalok betöltése sikertelen: ' + (error.message || 'Ismeretlen hiba'));
        }
    }

    async getSong(id) {
        if (!this.isAuthenticated()) {
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const record = await this.pb.collection('songs').getOne(id);
            return record;
        } catch (error) {
            console.error('Error fetching song:', error);
            throw new Error('Dal betöltése sikertelen');
        }
    }

    async createSong(songData) {
        if (!this.isAuthenticated()) {
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const userId = this.getCurrentUser().id;
            const token = this.getAuthToken();
            const data = {
                user: userId,
                title: songData.title || 'Névtelen dal',
                lyrics: songData.lyrics || '',
                prompt: songData.prompt || '',
            };

            // Use manual fetch if authStore doesn't work
            if (!this.pb.authStore.isValid && token) {
                console.log('🔧 Creating song with manual fetch');
                const response = await fetch('http://192.168.1.122:8090/api/collections/songs/records', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            }

            const record = await this.pb.collection('songs').create(data);
            return record;
        } catch (error) {
            console.error('Error creating song:', error);
            throw new Error('Dal létrehozása sikertelen');
        }
    }

    async updateSong(id, songData) {
        if (!this.isAuthenticated()) {
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const token = this.getAuthToken();
            const data = {
                title: songData.title,
                lyrics: songData.lyrics,
                prompt: songData.prompt,
            };

            // Use manual fetch if authStore doesn't work
            if (!this.pb.authStore.isValid && token) {
                console.log('🔧 Updating song with manual fetch');
                const response = await fetch(`http://192.168.1.122:8090/api/collections/songs/records/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            }

            const record = await this.pb.collection('songs').update(id, data);
            return record;
        } catch (error) {
            console.error('Error updating song:', error);
            throw new Error('Dal frissítése sikertelen');
        }
    }

    async deleteSong(id) {
        if (!this.isAuthenticated()) {
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const token = this.getAuthToken();

            // Use manual fetch if authStore doesn't work
            if (!this.pb.authStore.isValid && token) {
                console.log('🔧 Deleting song with manual fetch');
                const response = await fetch(`http://192.168.1.122:8090/api/collections/songs/records/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return;
            }

            await this.pb.collection('songs').delete(id);
        } catch (error) {
            console.error('Error deleting song:', error);
            throw new Error('Dal törlése sikertelen');
        }
    }

    // Migration helper: Import songs from localStorage
    async migrateSongsFromLocalStorage() {
        if (!this.isAuthenticated()) {
            throw new Error('Nem vagy bejelentkezve');
        }

        try {
            const localSongs = localStorage.getItem('suno_songs');
            if (!localSongs) {
                return { success: true, count: 0 };
            }

            const songs = JSON.parse(localSongs);
            const userId = this.getCurrentUser().id;
            let count = 0;

            for (const song of songs) {
                try {
                    await this.pb.collection('songs').create({
                        user: userId,
                        title: song.title || 'Névtelen dal',
                        lyrics: song.lyrics || '',
                        prompt: song.prompt || '',
                    });
                    count++;
                } catch (err) {
                    console.error('Failed to migrate song:', song, err);
                }
            }

            return { success: true, count };
        } catch (error) {
            console.error('Migration error:', error);
            throw new Error('Migráció sikertelen');
        }
    }
}

// Global instance
const pocketbase = new PocketBaseClient();

// Export for module usage
export default pocketbase;
