// Spotify Embed Player - No navigation, plays in chatbot
class SpotifyEmbedPlayer {
    constructor() {
        this.currentTrack = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
    }

    // Search Spotify and display results in chat
    async searchSongs(query) {
        try {
            addMessage(`🔍 Searching for "${query}"...`, 'bot');
            
            // Use Spotify's public embed API (no authentication needed)
            const searchResults = await this.searchSpotifyPublic(query);
            
            if (searchResults.length === 0) {
                addMessage(`❌ No songs found for "${query}"`, 'bot');
                return;
            }

            this.displaySearchResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
            addMessage('❌ Search failed. Please try again.', 'bot');
        }
    }

    // Search using Spotify's public endpoints
    async searchSpotifyPublic(query) {
        // For demo, using a curated Tamil songs library
        // In production, you'd use Spotify Web API
        const tamilSongs = [
            { id: '1', title: 'Vaseegara', artist: 'A.R. Rahman', movie: 'Minnale', spotifyId: '3JvrhDOgAt6p7K8mDyZwRd' },
            { id: '2', title: 'Hosanna', artist: 'A.R. Rahman', movie: 'VTV', spotifyId: '6RWp5VRAcYT3dmWE6dJWjr' },
            { id: '3', title: 'Aaluma Doluma', artist: 'Anirudh', movie: 'Vedalam', spotifyId: '2MZSXhKKHs2pRwTejTt3fW' },
            { id: '4', title: 'Vaathi Coming', artist: 'Anirudh', movie: 'Master', spotifyId: '3hGiScJTaBUKLW7XMQzXXk' },
            { id: '5', title: 'Arabic Kuthu', artist: 'Anirudh', movie: 'Beast', spotifyId: '1v7L65Lzy0j0vdpRjJewt1' },
            { id: '6', title: 'Rowdy Baby', artist: 'Dhanush', movie: 'Maari 2', spotifyId: '6Qs4SXO9dwPj5GKvVOv8Ki' },
            { id: '7', title: 'Why This Kolaveri Di', artist: 'Dhanush', movie: '3', spotifyId: '3bidbhpOYeV4knp8AIu8Xn' },
            { id: '8', title: 'Uyire Uyire', artist: 'A.R. Rahman', movie: 'Bombay', spotifyId: '5Y0RKYvXF0guhhmUvNQCJq' },
            { id: '9', title: 'Kadhal Rojave', artist: 'Harris Jayaraj', movie: 'Roja', spotifyId: '4kflIGfjdZJW3JLy9YPeTb' },
            { id: '10', title: 'Munbe Vaa', artist: 'A.R. Rahman', movie: 'Sillunu Oru Kaadhal', spotifyId: '4xdBrk0nFZaP6hxLjJKPEY' },
            { id: '11', title: 'Kannazhaga', artist: 'Anirudh', movie: '3', spotifyId: '2xLOMHjzkNJPPBz4TpQiTz' },
            { id: '12', title: 'Thalli Pogathey', artist: 'A.R. Rahman', movie: 'Achcham Yenbadhu Madamaiyada', spotifyId: '5TYJBf05rnDJqkLxpJkxVE' },
            { id: '13', title: 'Kannukul Kannai', artist: 'Yuvan Shankar Raja', movie: 'Vinnaithaandi Varuvaayaa', spotifyId: '1nqUB8E4LnEfQcl9QL6fNk' },
            { id: '14', title: 'Nenjukkul Peidhidum', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram', spotifyId: '0MBxPx3hjMVBfYfcFJu9tO' },
            { id: '15', title: 'Simtaangaran', artist: 'A.R. Rahman', movie: 'Sarkar', spotifyId: '5WUXXNSM7xOjZy1hb6aQXy' }
        ];

        const lowerQuery = query.toLowerCase();
        return tamilSongs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.movie.toLowerCase().includes(lowerQuery)
        );
    }

    // Display search results with play buttons
    displaySearchResults(results) {
        const resultsHtml = `
            <div class="spotify-search-results">
                <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">
                    🎵 Found ${results.length} song${results.length > 1 ? 's' : ''}
                </h3>
                <div class="songs-list">
                    ${results.map(song => `
                        <div class="song-result-item">
                            <div class="song-info-left">
                                <div class="song-title-result">${song.title}</div>
                                <div class="song-artist-result">${song.artist} • ${song.movie}</div>
                            </div>
                            <button onclick="spotifyEmbed.playSongEmbed('${song.spotifyId}', '${song.title}', '${song.artist}')" class="play-btn-result">
                                ▶️ Play
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        addBotMessage(resultsHtml);
    }

    // Play song using Spotify Embed (plays in chatbot)
    playSongEmbed(spotifyId, title, artist) {
        this.currentTrack = { spotifyId, title, artist };
        this.isPlaying = true;

        const playerHtml = `
            <div class="spotify-embed-container">
                <div class="now-playing-header">
                    <h3>🎵 Now Playing</h3>
                    <button onclick="spotifyEmbed.stopPlayer()" class="close-player-btn">✕</button>
                </div>
                <div class="song-details">
                    <div class="current-song-title">${title}</div>
                    <div class="current-song-artist">${artist}</div>
                </div>
                <iframe 
                    style="border-radius:12px" 
                    src="https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy">
                </iframe>
            </div>
        `;

        addBotMessage(playerHtml);
        addMessage(`🎵 Playing: ${title} by ${artist}`, 'bot');
    }

    // Play multiple songs as playlist
    playPlaylistEmbed(songs) {
        if (songs.length === 0) {
            addMessage('❌ No songs in playlist', 'bot');
            return;
        }

        this.playlist = songs;
        this.currentIndex = 0;
        
        this.displayPlaylistPlayer(songs);
    }

    // Display playlist with embed player
    displayPlaylistPlayer(songs) {
        const currentSong = songs[this.currentIndex];
        
        const playlistHtml = `
            <div class="spotify-playlist-container">
                <div class="playlist-header-embed">
                    <h3>🎵 Playlist (${this.currentIndex + 1}/${songs.length})</h3>
                    <button onclick="spotifyEmbed.stopPlayer()" class="close-player-btn">✕</button>
                </div>
                
                <div class="current-track-embed">
                    <div class="song-details">
                        <div class="current-song-title">${currentSong.title}</div>
                        <div class="current-song-artist">${currentSong.artist}</div>
                    </div>
                    <iframe 
                        style="border-radius:12px" 
                        src="https://open.spotify.com/embed/track/${currentSong.spotifyId}?utm_source=generator&theme=0" 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                    </iframe>
                </div>

                <div class="playlist-controls-embed">
                    <button onclick="spotifyEmbed.previousInPlaylist()" class="control-btn-embed" ${this.currentIndex === 0 ? 'disabled' : ''}>⏮️</button>
                    <button onclick="spotifyEmbed.nextInPlaylist()" class="control-btn-embed" ${this.currentIndex >= songs.length - 1 ? 'disabled' : ''}>⏭️</button>
                </div>

                <div class="playlist-queue-embed">
                    <h4>Up Next:</h4>
                    <div class="queue-items">
                        ${songs.slice(this.currentIndex + 1, this.currentIndex + 4).map((song, idx) => `
                            <div class="queue-item-embed">
                                <span>${this.currentIndex + idx + 2}. ${song.title}</span>
                                <span class="queue-artist">${song.artist}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        addBotMessage(playlistHtml);
    }

    // Next song in playlist
    nextInPlaylist() {
        if (this.currentIndex < this.playlist.length - 1) {
            this.currentIndex++;
            this.displayPlaylistPlayer(this.playlist);
            addMessage(`⏭️ Next: ${this.playlist[this.currentIndex].title}`, 'bot');
        } else {
            addMessage('✅ Playlist ended', 'bot');
        }
    }

    // Previous song in playlist
    previousInPlaylist() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displayPlaylistPlayer(this.playlist);
            addMessage(`⏮️ Previous: ${this.playlist[this.currentIndex].title}`, 'bot');
        }
    }

    // Show all available songs
    showAllSongs() {
        this.searchSongs(''); // Empty search shows all
    }

    // Stop player
    stopPlayer() {
        this.isPlaying = false;
        this.currentTrack = null;
        addMessage('⏹️ Player stopped', 'bot');
    }

    // Get mood-based playlist
    async getMoodPlaylist(mood) {
        const moodSongs = {
            'happy': [
                { spotifyId: '3JvrhDOgAt6p7K8mDyZwRd', title: 'Vaseegara', artist: 'A.R. Rahman' },
                { spotifyId: '2MZSXhKKHs2pRwTejTt3fW', title: 'Aaluma Doluma', artist: 'Anirudh' },
                { spotifyId: '6Qs4SXO9dwPj5GKvVOv8Ki', title: 'Rowdy Baby', artist: 'Dhanush' },
                { spotifyId: '1v7L65Lzy0j0vdpRjJewt1', title: 'Arabic Kuthu', artist: 'Anirudh' },
            ],
            'romantic': [
                { spotifyId: '6RWp5VRAcYT3dmWE6dJWjr', title: 'Hosanna', artist: 'A.R. Rahman' },
                { spotifyId: '5Y0RKYvXF0guhhmUvNQCJq', title: 'Uyire Uyire', artist: 'A.R. Rahman' },
                { spotifyId: '4xdBrk0nFZaP6hxLjJKPEY', title: 'Munbe Vaa', artist: 'A.R. Rahman' },
                { spotifyId: '5TYJBf05rnDJqkLxpJkxVE', title: 'Thalli Pogathey', artist: 'A.R. Rahman' },
            ],
            'energetic': [
                { spotifyId: '3hGiScJTaBUKLW7XMQzXXk', title: 'Vaathi Coming', artist: 'Anirudh' },
                { spotifyId: '2MZSXhKKHs2pRwTejTt3fW', title: 'Aaluma Doluma', artist: 'Anirudh' },
                { spotifyId: '5WUXXNSM7xOjZy1hb6aQXy', title: 'Simtaangaran', artist: 'A.R. Rahman' },
                { spotifyId: '6Qs4SXO9dwPj5GKvVOv8Ki', title: 'Rowdy Baby', artist: 'Dhanush' },
            ],
            'sad': [
                { spotifyId: '3bidbhpOYeV4knp8AIu8Xn', title: 'Why This Kolaveri Di', artist: 'Dhanush' },
                { spotifyId: '1nqUB8E4LnEfQcl9QL6fNk', title: 'Kannukul Kannai', artist: 'Yuvan Shankar Raja' },
                { spotifyId: '5TYJBf05rnDJqkLxpJkxVE', title: 'Thalli Pogathey', artist: 'A.R. Rahman' },
            ]
        };

        const songs = moodSongs[mood.toLowerCase()] || moodSongs['happy'];
        
        addMessage(`🎭 Creating ${mood} mood playlist...`, 'bot');
        setTimeout(() => {
            this.playPlaylistEmbed(songs);
        }, 500);
    }
}

// Create global instance
window.spotifyEmbed = new SpotifyEmbedPlayer();

console.log('🎵 Spotify Embed Player loaded successfully!');
