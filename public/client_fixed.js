const socket = io();

let currentAudio = null;
let currentPlaylist = null;
let currentSongIndex = 0;
let isPlaying = false;
let selectedMood = null;
let selectedLanguage = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    addWelcomeMessage();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMood(btn.dataset.mood));
    });

    // Language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', () => selectLanguage(btn.dataset.language));
    });

    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }

    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleKeyPress);
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleSearchKeyPress);
    }
}

// Handle chat form submission
function handleChatSubmit(e) {
    e.preventDefault();
    console.log('Chat form submitted');
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    console.log('Message:', message);
    
    if (message) {
        addMessage(message, 'user');
        
        // Send message to server
        socket.emit('chat', { 
            text: message,
            mood: selectedMood,
            language: selectedLanguage 
        });
        
        console.log('Message sent to server');
        input.value = '';
    }
}

// Handle key press for chat input
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleChatSubmit(e);
    }
}

// Handle key press for search input
function handleSearchKeyPress(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            addMessage(`Search YouTube: ${query}`, 'user');
            socket.emit('chat', { text: `search youtube ${query}` });
            e.target.value = '';
        }
    }
}

// Select mood
function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mood="${mood}"]`).classList.add('active');
    
    console.log('Selected mood:', mood);
    
    if (selectedLanguage) {
        requestPlaylists();
    } else {
        addMessage(`Great! You selected ${mood} mood. Now choose a language!`, 'bot');
    }
}

// Select language
function selectLanguage(language) {
    selectedLanguage = language;
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-language="${language}"]`).classList.add('active');
    
    console.log('Selected language:', language);
    
    if (selectedMood) {
        requestPlaylists();
    } else {
        addMessage(`Perfect! You chose ${language} language. Now pick your mood!`, 'bot');
    }
}

// Request playlists from server
function requestPlaylists() {
    if (selectedMood && selectedLanguage) {
        console.log('Requesting playlists for:', selectedMood, selectedLanguage);
        socket.emit('chat', {
            text: `I want ${selectedMood} ${selectedLanguage} music`,
            mood: selectedMood,
            language: selectedLanguage
        });
    }
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeMsg = `🎵 Welcome to your intelligent music companion! I'm here to help you discover amazing music based on your mood, language preferences, and favorite artists.

✨ I can:
• Recommend songs by mood and language
• Provide information about artists and movies  
• Search YouTube for music videos
• Suggest curated playlists
• Auto-play songs in sequence

Just tell me what you're feeling or what you'd like to listen to!`;
    
    addMessage(welcomeMsg, 'bot');
}

// Add message to chat
function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add bot message with HTML content
function addBotMessage(htmlContent) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = htmlContent;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add playlist cards
function addPlaylistCards(playlists) {
    console.log('Adding playlist cards:', playlists);
    const messages = document.getElementById('chatMessages');
    
    playlists.forEach(playlist => {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist-card';
        playlistDiv.onclick = () => openPlaylist(playlist);
        
        const moodIcon = getMoodIcon(playlist.mood);
        const languageFlag = getLanguageFlag(playlist.language);
        
        playlistDiv.innerHTML = `
            <div class="playlist-header">
                <div class="playlist-icon">
                    <i class="${moodIcon}"></i>
                </div>
                <div class="playlist-info">
                    <h4>${playlist.name}</h4>
                    <div class="playlist-meta">
                        ${languageFlag} ${playlist.language.charAt(0).toUpperCase() + playlist.language.slice(1)} • 
                        ${playlist.songs.length} songs • ${playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)}
                    </div>
                </div>
                <div class="playlist-actions">
                    <button class="play-all-btn" onclick="event.stopPropagation(); playAllSongs(${JSON.stringify(playlist).replace(/"/g, '&quot;')})">
                        <i class="fas fa-play"></i> Play All
                    </button>
                    <button class="view-songs-btn" onclick="event.stopPropagation(); showPlaylistSongs(${JSON.stringify(playlist).replace(/"/g, '&quot;')})">
                        <i class="fas fa-list"></i> View Songs
                    </button>
                </div>
            </div>
        `;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.appendChild(playlistDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messages.appendChild(messageDiv);
    });
    
    messages.scrollTop = messages.scrollHeight;
}

// Play all songs from playlist
function playAllSongs(playlist) {
    console.log('Playing all songs from:', playlist.name);
    addMessage(`🎵 Starting playlist: ${playlist.name}`, 'bot');
    
    // Show all songs
    showPlaylistSongs(playlist);
    
    // Start auto-play after showing songs
    setTimeout(() => {
        startAutoPlay([playlist]);
    }, 1000);
}

// Show playlist songs
function showPlaylistSongs(playlist) {
    console.log('Showing songs for:', playlist.name);
    const songListHtml = `
        <div class="playlist-details">
            <h4>🎵 ${playlist.name}</h4>
            <p style="margin-bottom: 1rem; color: #666;">
                ${playlist.songs.length} songs • ${playlist.language.charAt(0).toUpperCase() + playlist.language.slice(1)} • 
                ${playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)}
            </p>
            <div class="song-list">
                ${playlist.songs.map((song, index) => `
                    <div class="song-item" onclick="playSongDirectly('${song.title}', '${song.artist}')">
                        <div class="song-number">${index + 1}</div>
                        <div class="song-details">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <button class="play-btn" onclick="event.stopPropagation(); playSongDirectly('${song.title}', '${song.artist}')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="platform-actions">
                <p style="margin: 1rem 0; color: #666; text-align: center;">Choose your platform to listen:</p>
                <div class="platform-buttons-inline">
                    <button onclick="openMusicPlatform('youtube', '${playlist.name}')" class="platform-btn-small youtube">
                        <i class="fab fa-youtube"></i> YouTube
                    </button>
                    <button onclick="openMusicPlatform('spotify', '${playlist.name}')" class="platform-btn-small spotify">
                        <i class="fab fa-spotify"></i> Spotify
                    </button>
                    <button onclick="openMusicPlatform('apple', '${playlist.name}')" class="platform-btn-small apple">
                        <i class="fab fa-apple"></i> Apple Music
                    </button>
                    <button onclick="openMusicPlatform('jiosaavn', '${playlist.name}')" class="platform-btn-small jiosaavn">
                        <i class="fas fa-music"></i> JioSaavn
                    </button>
                </div>
            </div>
        </div>
    `;
    
    addBotMessage(songListHtml);
}

// Play song directly
function playSongDirectly(title, artist) {
    console.log('Playing song:', title, 'by', artist);
    addMessage(`🎵 Playing: ${title} by ${artist}`, 'bot');
    
    // Create platform links for this specific song
    const searchQuery = `${title} ${artist}`;
    const platformLinks = {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`,
        apple: `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`,
        jiosaavn: `https://www.jiosaavn.com/search/${encodeURIComponent(searchQuery)}`
    };
    
    addPlatformLinks(platformLinks, title);
}

// Open music platform with search
function openMusicPlatform(platform, query) {
    console.log('Opening platform:', platform, 'with query:', query);
    const encodedQuery = encodeURIComponent(query);
    const platformUrls = {
        youtube: `https://www.youtube.com/results?search_query=${encodedQuery}`,
        spotify: `https://open.spotify.com/search/${encodedQuery}`,
        apple: `https://music.apple.com/search?term=${encodedQuery}`,
        jiosaavn: `https://www.jiosaavn.com/search/${encodedQuery}`,
        gaana: `https://gaana.com/search/${encodedQuery}`,
        wynk: `https://wynk.in/music/search?q=${encodedQuery}`
    };
    
    if (platformUrls[platform]) {
        addMessage(`🎵 Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)} with "${query}"`, 'bot');
        window.open(platformUrls[platform], '_blank');
    }
}

// Add platform links
function addPlatformLinks(platformLinks, songName) {
    const linksHtml = `
        <div class="platform-links">
            <p style="margin-bottom: 0.5rem; font-weight: 600;">🎵 Listen to "${songName}" on:</p>
            <div class="platform-buttons-inline">
                <a href="${platformLinks.youtube}" target="_blank" class="platform-link">
                    <i class="fab fa-youtube"></i> YouTube
                </a>
                <a href="${platformLinks.spotify}" target="_blank" class="platform-link">
                    <i class="fab fa-spotify"></i> Spotify
                </a>
                <a href="${platformLinks.apple}" target="_blank" class="platform-link">
                    <i class="fab fa-apple"></i> Apple Music
                </a>
                <a href="${platformLinks.jiosaavn}" target="_blank" class="platform-link">
                    <i class="fas fa-music"></i> JioSaavn
                </a>
            </div>
        </div>
    `;
    
    addBotMessage(linksHtml);
}

// Add platform buttons for easy access
function addPlatformButtons(highlightPlatform = null) {
    const platformDiv = document.createElement('div');
    platformDiv.className = 'platform-buttons';
    
    const platforms = [
        { name: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000', url: 'https://youtube.com' },
        { name: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954', url: 'https://open.spotify.com' },
        { name: 'Apple Music', icon: 'fab fa-apple', color: '#000000', url: 'https://music.apple.com' },
        { name: 'JioSaavn', icon: 'fas fa-music', color: '#FF6600', url: 'https://jiosaavn.com' },
        { name: 'Gaana', icon: 'fas fa-headphones', color: '#FF6600', url: 'https://gaana.com' },
        { name: 'Wynk', icon: 'fas fa-play-circle', color: '#FF6B35', url: 'https://wynk.in' }
    ];
    
    platformDiv.innerHTML = `
        <div class="platform-header">🎵 Choose your preferred music platform:</div>
        <div class="platform-grid">
            ${platforms.map(platform => `
                <button class="platform-btn ${highlightPlatform === platform.name.toLowerCase() ? 'highlighted' : ''}" 
                        onclick="openPlatform('${platform.url}', '${platform.name}')"
                        style="border-left: 4px solid ${platform.color};">
                    <i class="${platform.icon}"></i>
                    <span>${platform.name}</span>
                </button>
            `).join('')}
        </div>
    `;
    
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.appendChild(platformDiv);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Open platform function
function openPlatform(url, platformName) {
    console.log('Opening platform:', platformName);
    addMessage(`🎵 Opening ${platformName}! Enjoy your music!`, 'bot');
    window.open(url, '_blank');
}

// Auto-play functionality for playlists
function startAutoPlay(playlists) {
    if (!playlists || playlists.length === 0) return;
    
    // Find the first playlist with songs
    const playlist = playlists.find(p => p.songs && p.songs.length > 0);
    if (!playlist) return;
    
    // Show auto-play notification
    addMessage('🎵 Auto-play starting! Playing songs from the recommended playlist in order...', 'bot');
    
    // Start playing songs in sequence
    let currentSongIndex = 0;
    const songs = playlist.songs;
    
    function playNextSong() {
        if (currentSongIndex >= songs.length) {
            addMessage('🎵 Playlist completed! Would you like me to suggest more music?', 'bot');
            return;
        }
        
        const song = songs[currentSongIndex];
        addMessage(`🎵 Now playing: ${song.title} by ${song.artist}`, 'bot');
        
        // Create platform links for the current song
        const platformLinks = createPlatformLinksForSong(song, playlist.language);
        addPlatformLinks(platformLinks, song.title);
        
        currentSongIndex++;
        
        // Play next song after 10 seconds (for demo purposes)
        setTimeout(() => {
            playNextSong();
        }, 10000);
    }
    
    // Start playing the first song
    setTimeout(() => {
        playNextSong();
    }, 1000);
}

// Create platform links for a specific song
function createPlatformLinksForSong(song, language) {
    const searchQuery = `${song.title} ${song.artist} ${language}`;
    return {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`,
        apple: `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`,
        jiosaavn: `https://www.jiosaavn.com/search/${encodeURIComponent(searchQuery)}`
    };
}

// Get mood icon
function getMoodIcon(mood) {
    const icons = {
        happy: 'fas fa-smile',
        sad: 'fas fa-frown',
        romantic: 'fas fa-heart',
        energetic: 'fas fa-bolt',
        relaxing: 'fas fa-leaf'
    };
    return icons[mood] || 'fas fa-music';
}

// Get language flag
function getLanguageFlag(language) {
    const flags = {
        tamil: '🇮🇳',
        hindi: '🇮🇳',
        telugu: '🇮🇳',
        malayalam: '🇮🇳',
        kannada: '🇮🇳',
        english: '🇺🇸'
    };
    return flags[language] || '🎵';
}

// Socket event listeners
socket.on('bot', (data) => {
    console.log('Received bot message:', data);
    
    if (data.playlists && data.playlists.length > 0) {
        addMessage(data.text, 'bot');
        addPlaylistCards(data.playlists);
        
        // Add platform buttons for easy access
        addPlatformButtons();
        
        // Auto-play functionality for playlists
        if (data.autoPlay && data.playlists.length > 0) {
            setTimeout(() => {
                startAutoPlay(data.playlists);
            }, 2000);
        }
    } else if (data.type === 'platform_request') {
        addMessage(data.text, 'bot');
        addPlatformButtons(data.platform);
    } else if (data.youtubeResults && data.youtubeResults.length > 0) {
        addMessage(data.text, 'bot');
        addYouTubeResults(data.youtubeResults);
    } else if (data.platformLinks) {
        addMessage(data.text, 'bot');
        addPlatformLinks(data.platformLinks, data.songName);
    } else if (data.type === 'music_info' && data.details) {
        addMusicInfoMessage(data.text, data.details, data.platformLinks);
    } else if (data.type === 'artist_info' && data.details) {
        addMusicInfoMessage(data.text, data.details, data.platformLinks);
    } else {
        addMessage(data.text, 'bot');
        
        // Show platform buttons for music-related responses
        if (data.showPlatformButtons || 
            data.type?.includes('music') || 
            data.followUp === 'language_preference' || 
            data.followUp === 'mood_preference') {
            setTimeout(() => {
                addPlatformButtons();
            }, 500);
        }
    }
    
    // Add confidence indicator for AI responses
    if (data.confidence && data.confidence < 0.7) {
        setTimeout(() => {
            addMessage("💡 If I didn't understand correctly, please try rephrasing or being more specific about what you're looking for!", 'bot');
        }, 1000);
    }
});

// Add music information message with details
function addMusicInfoMessage(text, details, platformLinks) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    
    if (platformLinks) {
        addPlatformLinks(platformLinks, details.name);
    }
    
    messages.scrollTop = messages.scrollHeight;
}

// Add YouTube results (if needed)
function addYouTubeResults(results) {
    const resultsHtml = `
        <div class="youtube-results">
            ${results.map(video => `
                <div class="youtube-item" onclick="playYouTubeVideo('${video.videoId}', '${video.title}')">
                    <div class="youtube-title">${video.title}</div>
                    <div class="youtube-channel">${video.channel}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    addBotMessage(resultsHtml);
}

// Play YouTube video
function playYouTubeVideo(videoId, title) {
    console.log('Playing YouTube video:', title);
    addMessage(`🎥 Playing: ${title}`, 'bot');
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}