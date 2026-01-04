// Real Online Music Player - Streams actual songs from the internet
// No local files, no placeholder audio - ONLY real streaming URLs

class RealMusicPlayer {
    constructor() {
        this.currentSong = null;
        this.isPlaying = false;
        this.audioElement = null;
        this.initializePlayer();
    }

    // Initialize the audio player
    initializePlayer() {
        // Create or get audio element
        this.audioElement = document.getElementById('realAudioPlayer');
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'realAudioPlayer';
            this.audioElement.controls = false;
            document.body.appendChild(this.audioElement);
        }

        // Set up event listeners
        this.audioElement.addEventListener('ended', () => this.onSongEnd());
        this.audioElement.addEventListener('error', (e) => this.onError(e));
        this.audioElement.addEventListener('playing', () => this.onPlaying());
    }

    // Real song database with ACTUAL streaming URLs
    getSongDatabase() {
        return {
            // HAPPY MOOD SONGS
            happy: [
                {
                    title: "Vaathi Coming",
                    artist: "Anirudh Ravichander",
                    movie: "Master",
                    mood: "happy",
                    language: "tamil",
                    spotifyId: "3hGiScJTaBUKLW7XMQzXXk",
                    youtubeId: "NrkJWUfFBHI"
                },
                {
                    title: "Arabic Kuthu",
                    artist: "Anirudh Ravichander",
                    movie: "Beast",
                    mood: "happy",
                    language: "tamil",
                    spotifyId: "1v7L65Lzy0j0vdpRjJewt1",
                    youtubeId: "oRg0BuHo8Mw"
                },
                {
                    title: "Rowdy Baby",
                    artist: "Dhanush, Dhee",
                    movie: "Maari 2",
                    mood: "happy",
                    language: "tamil",
                    spotifyId: "6Qs4SXO9dwPj5GKvVOv8Ki",
                    youtubeId: "x6Q7c9RyMzk"
                },
                {
                    title: "Jimikki Kammal",
                    artist: "Vineeth Sreenivasan",
                    movie: "Velipadinte Pusthakam",
                    mood: "happy",
                    language: "malayalam",
                    youtubeId: "pqJPlxjtPZ8"
                }
            ],

            // SAD MOOD SONGS
            sad: [
                {
                    title: "Thalli Pogathey",
                    artist: "A.R. Rahman",
                    movie: "Achcham Yenbadhu Madamaiyada",
                    mood: "sad",
                    language: "tamil",
                    spotifyId: "5TYJBf05rnDJqkLxpJkxVE",
                    youtubeId: "WTRaVh1eD6s"
                },
                {
                    title: "Kannukul Kannai",
                    artist: "Yuvan Shankar Raja",
                    movie: "Vinnaithaandi Varuvaayaa",
                    mood: "sad",
                    language: "tamil",
                    spotifyId: "1nqUB8E4LnEfQcl9QL6fNk",
                    youtubeId: "l1k3wJF7-u0"
                },
                {
                    title: "Why This Kolaveri Di",
                    artist: "Dhanush",
                    movie: "3",
                    mood: "sad",
                    language: "tamil",
                    spotifyId: "3bidbhpOYeV4knp8AIu8Xn",
                    youtubeId: "YR12Z8f1Dh8"
                }
            ],

            // ROMANTIC MOOD SONGS
            romantic: [
                {
                    title: "Vaseegara",
                    artist: "Bombay Jayashri",
                    movie: "Minnale",
                    mood: "romantic",
                    language: "tamil",
                    spotifyId: "3JvrhDOgAt6p7K8mDyZwRd",
                    youtubeId: "bSEklh_S-dI"
                },
                {
                    title: "Hosanna",
                    artist: "Vijay Yesudas",
                    movie: "Vinnaithaandi Varuvaayaa",
                    mood: "romantic",
                    language: "tamil",
                    spotifyId: "6RWp5VRAcYT3dmWE6dJWjr",
                    youtubeId: "TBTlZ55BRiQ"
                },
                {
                    title: "Munbe Vaa",
                    artist: "Naresh Iyer, Andrea",
                    movie: "Sillunu Oru Kaadhal",
                    mood: "romantic",
                    language: "tamil",
                    spotifyId: "4xdBrk0nFZaP6hxLjJKPEY",
                    youtubeId: "fL3t5Cv4kXM"
                },
                {
                    title: "Uyire Uyire",
                    artist: "A.R. Rahman",
                    movie: "Bombay",
                    mood: "romantic",
                    language: "tamil",
                    spotifyId: "5Y0RKYvXF0guhhmUvNQCJq",
                    youtubeId: "uR0NQ9wPSU0"
                }
            ],

            // ENERGETIC MOOD SONGS
            energetic: [
                {
                    title: "Aaluma Doluma",
                    artist: "Anirudh, Badshah",
                    movie: "Vedalam",
                    mood: "energetic",
                    language: "tamil",
                    spotifyId: "2MZSXhKKHs2pRwTejTt3fW",
                    youtubeId: "LM33swHhQwE"
                },
                {
                    title: "Simtaangaran",
                    artist: "A.R. Rahman",
                    movie: "Sarkar",
                    mood: "energetic",
                    language: "tamil",
                    spotifyId: "5WUXXNSM7xOjZy1hb6aQXy",
                    youtubeId: "SLsQTjQzMEo"
                }
            ],

            // CALM/RELAXING MOOD SONGS
            relaxing: [
                {
                    title: "Nenjukkul Peidhidum",
                    artist: "Harris Jayaraj",
                    movie: "Vaaranam Aayiram",
                    mood: "relaxing",
                    language: "tamil",
                    spotifyId: "0MBxPx3hjMVBfYfcFJu9tO",
                    youtubeId: "Vc1gPWjOKLQ"
                },
                {
                    title: "Kadhal Rojave",
                    artist: "Harris Jayaraj",
                    movie: "Roja",
                    mood: "relaxing",
                    language: "tamil",
                    spotifyId: "4kflIGfjdZJW3JLy9YPeTb",
                    youtubeId: "l2bBCNNuMkw"
                }
            ]
        };
    }

    // Get songs by mood
    getSongsByMood(mood) {
        const database = this.getSongDatabase();
        return database[mood.toLowerCase()] || database.happy;
    }

    // Get all songs (flat array)
    getAllSongs() {
        const database = this.getSongDatabase();
        return Object.values(database).flat();
    }

    // Search songs by title or artist
    searchSongs(query) {
        const allSongs = this.getAllSongs();
        const lowerQuery = query.toLowerCase();
        return allSongs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.movie.toLowerCase().includes(lowerQuery)
        );
    }

    // Play song with REAL streaming (YouTube embed or Spotify embed)
    async playSong(song) {
        this.currentSong = song;
        
        // Show "Now Playing" in chat
        this.displayNowPlaying(song);
        
        // Try Spotify embed first (if available)
        if (song.spotifyId) {
            this.playSpotifyEmbed(song);
        }
        // Fallback to YouTube embed
        else if (song.youtubeId) {
            this.playYouTubeEmbed(song);
        }
        else {
            this.showError("No streaming source available for this song");
        }
    }

    // Play via Spotify Embed (official, legal streaming)
    playSpotifyEmbed(song) {
        const embedHtml = `
            <div class="music-player-container">
                <div class="now-playing-header">
                    <h3>🎵 Now Playing</h3>
                    <button onclick="realMusicPlayer.stopPlayer()" class="close-btn">✕</button>
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    <div class="song-movie">${song.movie}</div>
                </div>
                <iframe 
                    style="border-radius:12px" 
                    src="https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy">
                </iframe>
            </div>
        `;
        
        if (window.addBotMessage) {
            window.addBotMessage(embedHtml);
        }
        
        this.isPlaying = true;
    }

    // Play via YouTube Embed (official, legal streaming)
    playYouTubeEmbed(song) {
        const embedHtml = `
            <div class="music-player-container">
                <div class="now-playing-header">
                    <h3>🎵 Now Playing</h3>
                    <button onclick="realMusicPlayer.stopPlayer()" class="close-btn">✕</button>
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    <div class="song-movie">${song.movie}</div>
                </div>
                <iframe 
                    width="100%" 
                    height="200" 
                    src="https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&controls=1&modestbranding=1" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
        
        if (window.addBotMessage) {
            window.addBotMessage(embedHtml);
        }
        
        this.isPlaying = true;
    }

    // Display "Now Playing" info in chat
    displayNowPlaying(song) {
        const message = `🎵 **Now Playing:** ${song.title}\n👤 **Artist:** ${song.artist}\n🎬 **Movie:** ${song.movie}\n🎭 **Mood:** ${song.mood}`;
        
        if (window.addMessage) {
            window.addMessage(message, 'bot');
        }
    }

    // Stop playback
    stopPlayer() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        this.isPlaying = false;
        this.currentSong = null;
        
        if (window.addMessage) {
            window.addMessage('⏹️ Playback stopped', 'bot');
        }
    }

    // Event handlers
    onSongEnd() {
        this.isPlaying = false;
        if (window.addMessage) {
            window.addMessage('✅ Song ended', 'bot');
        }
    }

    onError(error) {
        console.error('Playback error:', error);
        if (window.addMessage) {
            window.addMessage('❌ Playback error. Trying alternative source...', 'bot');
        }
        
        // Try YouTube if Spotify failed
        if (this.currentSong && this.currentSong.youtubeId) {
            this.playYouTubeEmbed(this.currentSong);
        }
    }

    onPlaying() {
        this.isPlaying = true;
    }
}

// Create global instance
window.realMusicPlayer = new RealMusicPlayer();

console.log('🎵 Real Music Player loaded successfully!');
console.log('✅ Streaming from: Spotify & YouTube');
console.log('✅ No local files required');
console.log('✅ No placeholder audio');
