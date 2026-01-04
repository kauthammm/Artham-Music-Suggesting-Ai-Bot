class PlaylistManager {
    constructor(localMusicPlayer, songsDatabase) {
        this.player = localMusicPlayer;
        this.songsDB = songsDatabase;
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.shuffle = false;
        this.repeat = false;
        this.playlistHistory = [];
    }

    // Create playlist by mood
    createMoodPlaylist(mood) {
        const moodSongs = this.songsDB.filter(song => 
            song.mood && song.mood.toLowerCase().includes(mood.toLowerCase())
        );
        
        if (moodSongs.length === 0) {
            return {
                success: false,
                message: `No songs found for mood: ${mood}`,
                availableMoods: this.getAvailableMoods()
            };
        }

        this.currentPlaylist = [...moodSongs];
        if (this.shuffle) {
            this.shufflePlaylist();
        }
        
        return {
            success: true,
            playlist: this.currentPlaylist,
            mood: mood,
            count: this.currentPlaylist.length
        };
    }

    // Create random playlist
    createRandomPlaylist(count = 5) {
        const shuffled = [...this.songsDB].sort(() => Math.random() - 0.5);
        this.currentPlaylist = shuffled.slice(0, Math.min(count, this.songsDB.length));
        
        return {
            success: true,
            playlist: this.currentPlaylist,
            type: 'random',
            count: this.currentPlaylist.length
        };
    }

    // Create playlist by artist
    createArtistPlaylist(artist) {
        const artistSongs = this.songsDB.filter(song => 
            song.artist && song.artist.toLowerCase().includes(artist.toLowerCase())
        );
        
        if (artistSongs.length === 0) {
            return {
                success: false,
                message: `No songs found for artist: ${artist}`,
                availableArtists: this.getAvailableArtists()
            };
        }

        this.currentPlaylist = [...artistSongs];
        return {
            success: true,
            playlist: this.currentPlaylist,
            artist: artist,
            count: this.currentPlaylist.length
        };
    }

    // Get available moods
    getAvailableMoods() {
        const moods = new Set();
        this.songsDB.forEach(song => {
            if (song.mood) {
                if (Array.isArray(song.mood)) {
                    song.mood.forEach(m => moods.add(m));
                } else {
                    moods.add(song.mood);
                }
            }
        });
        return Array.from(moods);
    }

    // Get available artists
    getAvailableArtists() {
        const artists = new Set();
        this.songsDB.forEach(song => {
            if (song.artist) {
                artists.add(song.artist);
            }
        });
        return Array.from(artists);
    }

    // Play current playlist
    async playPlaylist(startIndex = 0) {
        if (this.currentPlaylist.length === 0) {
            return { success: false, message: "No playlist loaded" };
        }

        this.currentIndex = startIndex;
        this.isPlaying = true;
        
        const result = await this.playCurrentSong();
        
        // Set up auto-next when song ends
        this.setupAutoNext();
        
        return result;
    }

    // Play current song in playlist
    async playCurrentSong() {
        if (this.currentIndex >= this.currentPlaylist.length) {
            return { success: false, message: "End of playlist" };
        }

        const currentSong = this.currentPlaylist[this.currentIndex];
        const result = await this.player.loadAndPlayAudio(`audio-samples/${currentSong.filename}`, currentSong);
        
        // Update now playing info
        this.updateNowPlaying(currentSong);
        
        return {
            success: result.success,
            song: currentSong,
            index: this.currentIndex,
            total: this.currentPlaylist.length
        };
    }

    // Next song
    async nextSong() {
        if (!this.isPlaying) return { success: false, message: "No playlist playing" };
        
        if (this.repeat && this.currentIndex === this.currentPlaylist.length - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        
        if (this.currentIndex >= this.currentPlaylist.length) {
            this.isPlaying = false;
            return { success: false, message: "End of playlist reached" };
        }
        
        return await this.playCurrentSong();
    }

    // Previous song
    async previousSong() {
        if (!this.isPlaying) return { success: false, message: "No playlist playing" };
        
        this.currentIndex = Math.max(0, this.currentIndex - 1);
        return await this.playCurrentSong();
    }

    // Shuffle playlist
    shufflePlaylist() {
        if (this.currentPlaylist.length === 0) return;
        
        const currentSong = this.currentPlaylist[this.currentIndex];
        
        // Shuffle the playlist
        for (let i = this.currentPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentPlaylist[i], this.currentPlaylist[j]] = [this.currentPlaylist[j], this.currentPlaylist[i]];
        }
        
        // Find the new index of the current song
        this.currentIndex = this.currentPlaylist.findIndex(song => song.id === currentSong.id);
        if (this.currentIndex === -1) this.currentIndex = 0;
        
        this.shuffle = true;
    }

    // Toggle shuffle
    toggleShuffle() {
        this.shuffle = !this.shuffle;
        if (this.shuffle && this.currentPlaylist.length > 0) {
            this.shufflePlaylist();
        }
        return this.shuffle;
    }

    // Toggle repeat
    toggleRepeat() {
        this.repeat = !this.repeat;
        return this.repeat;
    }

    // Setup auto-next functionality
    setupAutoNext() {
        if (this.player.audio) {
            this.player.audio.addEventListener('ended', () => {
                this.nextSong();
            });
        }
    }

    // Update now playing display
    updateNowPlaying(song) {
        const nowPlayingHtml = `
            <div class="now-playing-container">
                <div class="now-playing-header">
                    <h3>🎵 Now Playing</h3>
                    <div class="playlist-controls">
                        <button onclick="playlistManager.previousSong()" class="control-btn">⏮️</button>
                        <button onclick="playlistManager.nextSong()" class="control-btn">⏭️</button>
                        <button onclick="playlistManager.toggleShuffle()" class="control-btn ${this.shuffle ? 'active' : ''}">🔀</button>
                        <button onclick="playlistManager.toggleRepeat()" class="control-btn ${this.repeat ? 'active' : ''}">🔁</button>
                    </div>
                </div>
                <div class="now-playing-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    <div class="playlist-position">${this.currentIndex + 1} of ${this.currentPlaylist.length}</div>
                </div>
                <div class="playlist-queue">
                    <h4>Queue:</h4>
                    <div class="queue-list">
                        ${this.getQueueHtml()}
                    </div>
                </div>
            </div>
        `;
        
        // Add to chat
        addMessage(nowPlayingHtml, 'bot');
    }

    // Get queue HTML
    getQueueHtml() {
        return this.currentPlaylist.slice(this.currentIndex + 1, this.currentIndex + 4)
            .map((song, index) => `
                <div class="queue-item">
                    <span class="queue-number">${this.currentIndex + index + 2}.</span>
                    <span class="queue-title">${song.title}</span>
                    <span class="queue-artist">${song.artist}</span>
                </div>
            `).join('');
    }

    // Get current playlist info
    getCurrentPlaylistInfo() {
        return {
            playlist: this.currentPlaylist,
            currentIndex: this.currentIndex,
            isPlaying: this.isPlaying,
            shuffle: this.shuffle,
            repeat: this.repeat,
            currentSong: this.currentPlaylist[this.currentIndex] || null
        };
    }

    // Clear playlist
    clearPlaylist() {
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        if (this.player.audio) {
            this.player.audio.pause();
        }
    }

    // Create smart playlist based on current time/mood
    createSmartPlaylist() {
        const hour = new Date().getHours();
        let mood;
        
        if (hour >= 6 && hour < 12) {
            mood = 'energetic'; // Morning energy
        } else if (hour >= 12 && hour < 17) {
            mood = 'upbeat'; // Afternoon vibes
        } else if (hour >= 17 && hour < 21) {
            mood = 'romantic'; // Evening romance
        } else {
            mood = 'calm'; // Night chill
        }
        
        return this.createMoodPlaylist(mood);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaylistManager;
}