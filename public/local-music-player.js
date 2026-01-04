// Local Audio Player System - No External Dependencies!
class LocalMusicPlayer {
    constructor() {
        this.currentAudio = null;
        this.currentSong = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.shuffle = false;
        this.repeat = false;
        this.volume = 0.8;
        
        this.initializePlayer();
    }

    initializePlayer() {
        console.log('🎵 Initializing Local Music Player...');
        
        // Create audio element
        this.audioElement = document.createElement('audio');
        this.audioElement.volume = this.volume;
        this.audioElement.preload = 'metadata';
        
        // Add event listeners
        this.audioElement.addEventListener('ended', () => this.onSongEnded());
        this.audioElement.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audioElement.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audioElement.addEventListener('error', (e) => this.onError(e));
        this.audioElement.addEventListener('canplay', () => this.onCanPlay());
        
        console.log('✅ Local Music Player initialized successfully');
    }

    // Play a song by ID
    playSong(songId) {
        const song = window.tamilSongsDB[songId];
        if (!song) {
            console.error('❌ Song not found:', songId);
            this.playFallbackAudio('Song not found in local database');
            return false;
        }

        console.log('🎵 Playing local song:', song.title);
        this.currentSong = song;
        
        this.updateNowPlaying(song);
        
        // Try to load the audio file
        const audioPath = song.audioFile;
        this.loadAndPlayAudio(audioPath, song);
        
        return true;
    }

    // Load and play audio file
    loadAndPlayAudio(audioPath, song) {
        console.log('🔊 Loading audio:', audioPath);
        
        // Stop current audio if playing
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        // Show audio player UI
        this.showAudioPlayer();
        
        // Check if file exists by trying to load it
        this.audioElement.src = audioPath;
        this.audioElement.load();
        
        // Add error handler for file not found
        this.audioElement.onerror = () => {
            console.log('⚠️ Audio file not found at:', audioPath);
            this.showFileNotFoundMessage(song);
        };
        
        // Try to play
        const playPromise = this.audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ Audio started playing from local file');
                this.isPlaying = true;
                this.updatePlayerStatus(`🎵 Playing: ${song.title} (Local File)`);
            }).catch(error => {
                console.log('⚠️ Could not play audio file:', error.message);
                this.showFileNotFoundMessage(song);
            });
        }
    }

    // Show message when file not found and provide download instructions
    showFileNotFoundMessage(song) {
        console.log('📁 Audio file not found, showing instructions');
        
        const instructions = `
            <div class="file-not-found-container">
                <h4>🎵 ${song.title} - Audio File Not Found</h4>
                <p>To play this song, download the MP3 file and save it as:</p>
                <div class="filename-box">
                    <code>${song.audioFile}</code>
                </div>
                <div class="download-instructions">
                    <h5>📥 How to add the song:</h5>
                    <ol>
                        <li>Download <strong>${song.title}</strong> MP3 file</li>
                        <li>Rename it to: <code>${song.id}.mp3</code></li>
                        <li>Save in folder: <code>C:\\Users\\Kautham\\OneDrive\\Desktop\\Chatbot\\public\\audio-samples\\</code></li>
                        <li>Refresh the page and try again!</li>
                    </ol>
                </div>
                <div class="song-details">
                    <p><strong>Song:</strong> ${song.title}</p>
                    <p><strong>Artist:</strong> ${song.artist}</p>
                    <p><strong>Movie:</strong> ${song.movie}</p>
                    <p><strong>Year:</strong> ${song.year}</p>
                </div>
            </div>
        `;
        
        // Add message to chat
        if (window.addBotMessage) {
            window.addBotMessage(instructions);
        }
        
        this.updatePlayerStatus(`📁 Add ${song.id}.mp3 to audio-samples folder to play this song`);
        
        // Play a simple preview tone
        this.createFallbackTone(song.title);
    }

    // Play fallback audio when local file not available
    playFallbackAudio(songTitle) {
        console.log('🔄 Playing fallback audio for:', songTitle);
        
        // Create a simple audio tone as fallback
        this.createFallbackTone(songTitle);
        
        this.updatePlayerStatus(`🎵 Preview: ${songTitle} (Add MP3 file for full song)`);
    }

    // Create simple audio tone as preview
    createFallbackTone(songTitle) {
        // Use Web Audio API to create a simple preview tone
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a simple melody based on song title
            const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C scale
            let noteIndex = 0;
            
            oscillator.frequency.setValueAtTime(frequencies[noteIndex], audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // Play a sequence of notes
            for (let i = 1; i < 8; i++) {
                const nextOscillator = audioContext.createOscillator();
                const nextGain = audioContext.createGain();
                
                nextOscillator.connect(nextGain);
                nextGain.connect(audioContext.destination);
                
                nextOscillator.frequency.setValueAtTime(frequencies[(noteIndex + i) % frequencies.length], audioContext.currentTime);
                nextOscillator.type = 'sine';
                
                nextGain.gain.setValueAtTime(0, audioContext.currentTime + (i * 0.5));
                nextGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + (i * 0.5) + 0.1);
                nextGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + (i * 0.5) + 0.4);
                
                nextOscillator.start(audioContext.currentTime + (i * 0.5));
                nextOscillator.stop(audioContext.currentTime + (i * 0.5) + 0.4);
            }
            
            this.isPlaying = true;
            setTimeout(() => {
                this.isPlaying = false;
                this.updatePlayerStatus(`🎵 Preview finished: ${songTitle}`);
            }, 4000);
            
        } catch (error) {
            console.log('Web Audio not supported, showing message instead');
            this.updatePlayerStatus(`🎵 "${songTitle}" - Add MP3 file to /audio-samples/ folder`);
        }
    }

    // Show audio player UI
    showAudioPlayer() {
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        const youtubePlayer = document.getElementById('youtubePlayer');
        const customPlayer = document.getElementById('customPlayer');
        
        if (audioPlayerContainer) audioPlayerContainer.style.display = 'block';
        if (youtubePlayer) youtubePlayer.style.display = 'none';
        if (customPlayer) customPlayer.style.display = 'none';
    }

    // Update now playing display
    updateNowPlaying(song) {
        const elements = {
            songTitle: document.getElementById('songTitle'),
            songArtist: document.getElementById('songArtist'),
            nowPlaying: document.getElementById('nowPlaying')
        };
        
        if (elements.songTitle) elements.songTitle.textContent = song.title;
        if (elements.songArtist) elements.songArtist.textContent = `${song.artist} • ${song.movie}`;
        if (elements.nowPlaying) elements.nowPlaying.style.display = 'block';
        
        // Update custom player
        const playerSongTitle = document.getElementById('playerSongTitle');
        const playerArtist = document.getElementById('playerArtist');
        
        if (playerSongTitle) playerSongTitle.textContent = song.title;
        if (playerArtist) playerArtist.textContent = song.artist;
    }

    // Update player status
    updatePlayerStatus(message) {
        const statusElement = document.getElementById('audioPlayerStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('🎵 Player Status:', message);
    }

    // Event handlers
    onSongEnded() {
        console.log('🎵 Song ended');
        this.isPlaying = false;
        this.updatePlayerStatus('🎵 Song finished');
        
        // Auto-play next song if in playlist mode
        if (this.playlist.length > 1 && this.currentIndex < this.playlist.length - 1) {
            setTimeout(() => {
                this.playNext();
            }, 1000);
        }
    }

    onTimeUpdate() {
        if (this.audioElement.duration) {
            const currentTime = Math.floor(this.audioElement.currentTime);
            const duration = Math.floor(this.audioElement.duration);
            const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            
            // Update progress bar if exists
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    onMetadataLoaded() {
        console.log('✅ Audio metadata loaded');
        if (this.currentSong) {
            this.updatePlayerStatus(`🎵 Ready: ${this.currentSong.title}`);
        }
    }

    onCanPlay() {
        console.log('✅ Audio can start playing');
    }

    onError(error) {
        console.log('⚠️ Audio error:', error);
        if (this.currentSong) {
            this.playFallbackAudio(this.currentSong.title);
        }
    }

    // Control methods
    play() {
        if (this.audioElement && this.audioElement.paused) {
            this.audioElement.play();
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }

    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
        }
    }

    playNext() {
        if (this.playlist.length > 0 && this.currentIndex < this.playlist.length - 1) {
            this.currentIndex++;
            this.playSong(this.playlist[this.currentIndex]);
        }
    }

    playPrevious() {
        if (this.playlist.length > 0 && this.currentIndex > 0) {
            this.currentIndex--;
            this.playSong(this.playlist[this.currentIndex]);
        }
    }

    // Playlist management
    setPlaylist(songIds) {
        this.playlist = songIds;
        this.currentIndex = 0;
        console.log('🎵 Playlist set:', songIds);
    }

    // Search local database
    searchLocalSongs(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        Object.values(window.tamilSongsDB).forEach(song => {
            if (song.title.toLowerCase().includes(searchTerm) ||
                song.artist.toLowerCase().includes(searchTerm) ||
                song.movie.toLowerCase().includes(searchTerm) ||
                song.mood.some(mood => mood.includes(searchTerm))) {
                results.push(song);
            }
        });
        
        return results;
    }

    // Get songs by mood
    getSongsByMood(mood) {
        const songIds = window.genreCollections[mood] || [];
        return songIds.map(id => window.tamilSongsDB[id]).filter(Boolean);
    }

    // Check which songs have actual MP3 files
    async checkAvailableFiles() {
        const availableFiles = {};
        const songIds = Object.keys(window.tamilSongsDB);
        
        console.log('🔍 Checking for available MP3 files...');
        
        for (const songId of songIds) {
            const song = window.tamilSongsDB[songId];
            const audioPath = song.audioFile;
            
            try {
                // Create a test audio element to check if file exists
                const testAudio = new Audio();
                testAudio.src = audioPath;
                
                await new Promise((resolve, reject) => {
                    testAudio.addEventListener('canplaythrough', () => {
                        availableFiles[songId] = true;
                        console.log(`✅ ${song.title} - File available`);
                        resolve();
                    });
                    
                    testAudio.addEventListener('error', () => {
                        availableFiles[songId] = false;
                        console.log(`❌ ${song.title} - File missing`);
                        resolve(); // Don't reject, just mark as unavailable
                    });
                    
                    // Timeout after 2 seconds
                    setTimeout(() => {
                        availableFiles[songId] = false;
                        console.log(`⏱️ ${song.title} - Timeout (file likely missing)`);
                        resolve();
                    }, 2000);
                });
                
            } catch (error) {
                availableFiles[songId] = false;
                console.log(`❌ ${song.title} - Error checking file`);
            }
        }
        
        this.availableFiles = availableFiles;
        const availableCount = Object.values(availableFiles).filter(Boolean).length;
        console.log(`📊 Found ${availableCount} out of ${songIds.length} songs with MP3 files`);
        
        return availableFiles;
    }

    // Get list of songs with available MP3 files
    getAvailableSongs() {
        if (!this.availableFiles) {
            return Object.keys(window.tamilSongsDB); // Return all if not checked
        }
        
        return Object.keys(this.availableFiles).filter(songId => this.availableFiles[songId]);
    }

    // Get list of songs missing MP3 files
    getMissingSongs() {
        if (!this.availableFiles) {
            return []; // Return empty if not checked
        }
        
        return Object.keys(this.availableFiles).filter(songId => !this.availableFiles[songId]);
    }

    // Get songs by artist
    getSongsByArtist(artist) {
        const artistKey = artist.toLowerCase().replace(/[^a-z]/g, '');
        const songIds = window.artistCollections[artistKey] || [];
        return songIds.map(id => window.tamilSongsDB[id]).filter(Boolean);
    }

    // Show file status for all songs
    showFileStatus() {
        if (!this.availableFiles) {
            console.log('📁 File availability not checked yet. Call checkAvailableFiles() first.');
            return;
        }

        const available = this.getAvailableSongs();
        const missing = this.getMissingSongs();

        console.log('📊 Song File Status:');
        console.log(`✅ Available (${available.length}):`, available.map(id => window.tamilSongsDB[id].title));
        console.log(`❌ Missing (${missing.length}):`, missing.map(id => window.tamilSongsDB[id].title));

        const statusHtml = `
            <div class="file-status-container">
                <h3>📊 Song File Status</h3>
                <div class="status-section">
                    <h4>✅ Available Songs (${available.length})</h4>
                    ${available.length > 0 ? 
                        `<div class="available-songs">
                            ${available.map(id => {
                                const song = window.tamilSongsDB[id];
                                return `<div class="status-song-item available" onclick="playLocalSong('${id}')">
                                    <span class="song-title">${song.title}</span>
                                    <span class="song-artist">${song.artist}</span>
                                    <span class="play-icon">▶️</span>
                                </div>`;
                            }).join('')}
                        </div>` 
                        : '<p>No MP3 files found</p>'
                    }
                </div>
                <div class="status-section">
                    <h4>❌ Missing Songs (${missing.length})</h4>
                    ${missing.length > 0 ? 
                        `<div class="missing-songs">
                            ${missing.map(id => {
                                const song = window.tamilSongsDB[id];
                                return `<div class="status-song-item missing">
                                    <span class="song-title">${song.title}</span>
                                    <span class="song-artist">${song.artist}</span>
                                    <span class="file-name">Need: ${song.id}.mp3</span>
                                </div>`;
                            }).join('')}
                        </div>` 
                        : '<p>All songs have MP3 files! 🎉</p>'
                    }
                </div>
            </div>
        `;

        if (window.addBotMessage) {
            window.addBotMessage(statusHtml);
        }
    }
}

// Create global instance
window.localMusicPlayer = new LocalMusicPlayer();

// Initialize playlist manager after the database is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof tamilSongsDB !== 'undefined' && typeof PlaylistManager !== 'undefined') {
        window.playlistManager = new PlaylistManager(window.localMusicPlayer, tamilSongsDB);
        console.log('🎶 Playlist Manager initialized successfully!');
    }
});

console.log('🎵 Local Music Player System loaded successfully!');