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
    console.log('Chat form submitted'); // Debug log
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    console.log('Message:', message); // Debug log
    
    if (message) {
        addMessage(message, 'user');
        
        // Send message to server
        socket.emit('chat', { 
            text: message,
            mood: selectedMood,
            language: selectedLanguage 
        });
        
        console.log('Message sent to server'); // Debug log
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
    
    if (selectedLanguage) {
        requestPlaylists(mood, selectedLanguage);
    } else {
        addMessage(`Great! I can feel the ${mood} vibes! 🎵 Now select a language to get perfect playlist recommendations.`, 'bot');
    }
}

// Select language
function selectLanguage(language) {
    selectedLanguage = language;
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-language="${language}"]`).classList.add('active');
    
    if (selectedMood) {
        requestPlaylists(selectedMood, language);
    } else {
        addMessage(`Perfect! I love ${language} music! 🎶 Now tell me your mood to get amazing playlist suggestions.`, 'bot');
    }
}

// Request playlists based on mood and language
function requestPlaylists(mood, language) {
    const message = `Show me ${mood} ${language} playlists`;
    addMessage(message, 'user');
    socket.emit('chat', { text: message, mood: mood, language: language });
}

// Send message function
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message) {
        addMessage(message, 'user');
        socket.emit('chat', { text: message });
        input.value = '';
    }
}

// Handle Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Handle global search
function handleGlobalSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            addMessage(`Search: ${query}`, 'user');
            socket.emit('search', { query: query });
        }
    }
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeText = `🎵 Hello! I'm MoodTunes, your AI music companion. I can help you discover amazing playlists based on your mood and language preferences, or we can just have a friendly chat! 

Try asking me:
• "I feel happy" 
• "Tell me about A.R. Rahman"
• "Who composed Roja songs?"
• "Play some sad Tamil songs"
• Or just chat with me!

How are you feeling today?`;
    
    addMessage(welcomeText, 'bot');
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
    content.innerHTML = text.replace(/\n/g, '<br>');
    
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

// Add playlist cards display
function addPlaylistCards(playlists) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-list"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    playlists.forEach(playlist => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        
        playlistCard.innerHTML = `
            <div class="playlist-title">${playlist.name}</div>
            <div class="playlist-meta">
                ${playlist.language} • ${playlist.mood} • ${playlist.songs.length} songs
                <br>Curated by ${playlist.curator}
            </div>
            <div class="platform-links">
                <a href="${playlist.platforms.youtube}" target="_blank" class="platform-link">
                    <i class="fab fa-youtube"></i> YouTube
                </a>
                <a href="${playlist.platforms.spotify}" target="_blank" class="platform-link">
                    <i class="fab fa-spotify"></i> Spotify
                </a>
                <a href="${playlist.platforms.appleMusic}" target="_blank" class="platform-link">
                    <i class="fab fa-apple"></i> Apple Music
                </a>
                <a href="${playlist.platforms.jiosaavn}" target="_blank" class="platform-link">
                    <i class="fas fa-music"></i> JioSaavn
                </a>
            </div>
        `;
        
        content.appendChild(playlistCard);
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add playlist cards
function addPlaylistCards(playlists) {
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
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messages.appendChild(messageDiv);
    });
    
    messages.scrollTop = messages.scrollHeight;
}

// Play all songs from playlist
function playAllSongs(playlist) {
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

// Open playlist and show songs
function openPlaylist(playlist) {
    currentPlaylist = playlist;
    currentSongIndex = 0;
    
    const songListHtml = `
        <div class="playlist-details">
            <h4>🎵 ${playlist.name}</h4>
            <p style="margin-bottom: 1rem; color: #666;">
                ${playlist.songs.length} songs • ${playlist.language.charAt(0).toUpperCase() + playlist.language.slice(1)} • 
                ${playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)}
            </p>
            <div class="song-list">
                ${playlist.songs.map((song, index) => `
                    <div class="song-item" onclick="playSongFromPlaylist(${index})">
                        <div class="song-number">${index + 1}</div>
                        <div class="song-details">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <button class="play-btn" onclick="event.stopPropagation(); playSongFromPlaylist(${index})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    addBotMessage(songListHtml);
}

// Play song from playlist
function playSongFromPlaylist(index) {
    if (!currentPlaylist) return;
    
    currentSongIndex = index;
    const song = currentPlaylist.songs[index];
    
    // Update now playing display
    updateNowPlaying(song.title, song.artist);
    
    // Play from YouTube (using placeholder for now)
    playYouTubeVideo({ 
        videoId: song.youtube, 
        title: song.title 
    });
    
    addMessage(`Now playing: ${song.title} by ${song.artist}`, 'bot');
}

// Get mood icon
function getMoodIcon(mood) {
    const icons = {
        happy: 'fas fa-smile',
        sad: 'fas fa-sad-tear',
        energetic: 'fas fa-bolt',
        romantic: 'fas fa-heart',
        relaxed: 'fas fa-leaf'
    };
    return icons[mood] || 'fas fa-music';
}

// Get language flag
function getLanguageFlag(language) {
    const flags = {
        tamil: '🏴',
        hindi: '🇮🇳',
        malayalam: '🏴',
        kannada: '🏴',
        telugu: '🏴',
        english: '🇺🇸'
    };
    return flags[language] || '🎵';
}

// Update now playing display
function updateNowPlaying(title, artist) {
    const nowPlayingSection = document.getElementById('nowPlayingSection');
    const currentTitle = document.getElementById('currentTitle');
    const currentArtist = document.getElementById('currentArtist');
    
    if (nowPlayingSection && currentTitle && currentArtist) {
        nowPlayingSection.style.display = 'block';
        currentTitle.textContent = title;
        currentArtist.textContent = artist;
    }
}

// Toggle play/pause
function togglePlayPause() {
    const playIcon = document.getElementById('playIcon');
    const audioPlayer = document.getElementById('audioPlayer');
    
    if (isPlaying) {
        if (audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
        }
        playIcon.className = 'fas fa-play';
        isPlaying = false;
    } else {
        if (audioPlayer && audioPlayer.paused) {
            audioPlayer.play();
        }
        playIcon.className = 'fas fa-pause';
        isPlaying = true;
    }
}

// Play YouTube video
function playYouTubeVideo(video) {
    const youtubePlayer = document.getElementById('youtubePlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    
    // Hide audio player
    audioPlayer.style.display = 'none';
    
    // Show YouTube player
    youtubePlayer.style.display = 'block';
    youtubePlayer.innerHTML = `
        <iframe width="100%" height="200" 
                src="https://www.youtube.com/embed/${video.videoId}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    `;
    
    isPlaying = true;
    document.getElementById('playIcon').className = 'fas fa-pause';
}

// Play local music
function playLocalMusic(music) {
    const audioPlayer = document.getElementById('audioPlayer');
    const youtubePlayer = document.getElementById('youtubePlayer');
    
    // Hide YouTube player
    youtubePlayer.style.display = 'none';
    youtubePlayer.innerHTML = '';
    
    // Show audio player
    audioPlayer.style.display = 'block';
    audioPlayer.src = music.url;
    audioPlayer.play();
    
    updateNowPlaying(music.title, 'Local File');
    isPlaying = true;
    document.getElementById('playIcon').className = 'fas fa-pause';
    
    currentAudio = audioPlayer;
}

// Upload file function
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('musicFile', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
    formData.append('mood', selectedMood || 'unknown');
    formData.append('language', selectedLanguage || 'unknown');
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            addMessage(`✅ "${result.file.title}" uploaded successfully!`, 'bot');
            fileInput.value = '';
        } else {
            addMessage('❌ Upload failed: ' + result.error, 'bot');
        }
    } catch (error) {
        addMessage('❌ Upload error: ' + error.message, 'bot');
    }
}

// Open platform
function openPlatform(platform) {
    const urls = {
        youtube: 'https://music.youtube.com',
        spotify: 'https://open.spotify.com',
        soundcloud: 'https://soundcloud.com',
        apple: 'https://music.apple.com'
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
    }
}

// Socket event listeners
socket.on('bot', (data) => {
    if (data.playlists && data.playlists.length > 0) {
        addMessage(data.text, 'bot');
        addPlaylistCards(data.playlists);
        
        // Add platform buttons for easy access
        addPlatformButtons();
        
        // Auto-play functionality for playlists
        if (data.autoPlay && data.playlists.length > 0) {
            setTimeout(() => {
                startAutoPlay(data.playlists);
            }, 2000); // Wait 2 seconds before starting auto-play
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

// Add platform buttons for easy access
function addPlatformButtons(highlightPlatform = null) {
    const messages = document.getElementById('chatMessages');
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
    addMessage(`🎵 Opening ${platformName}! Enjoy your music!`, 'bot');
    window.open(url, '_blank');
}

// Add music information message with details
function addMusicInfoMessage(text, details, platformLinks) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-music"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Add main text
    const textDiv = document.createElement('div');
    textDiv.innerHTML = text.replace(/\n/g, '<br>');
    content.appendChild(textDiv);
    
    // Add platform links if available
    if (platformLinks) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'platform-links-container';
        linksDiv.innerHTML = '<br><strong>🎵 Listen on:</strong>';
        
        const linksGrid = document.createElement('div');
        linksGrid.className = 'platform-links';
        
        Object.entries(platformLinks).forEach(([platform, url]) => {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.className = 'platform-link';
            link.innerHTML = getPlatformIcon(platform) + ' ' + getPlatformName(platform);
            linksGrid.appendChild(link);
        });
        
        linksDiv.appendChild(linksGrid);
        content.appendChild(linksDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add platform links display
function addPlatformLinks(platformLinks, songName) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-link"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const linksContainer = document.createElement('div');
    linksContainer.className = 'platform-links-container';
    
    const title = document.createElement('div');
    title.innerHTML = `<strong>🎵 "${songName}" on different platforms:</strong>`;
    linksContainer.appendChild(title);
    
    const linksGrid = document.createElement('div');
    linksGrid.className = 'platform-links';
    linksGrid.style.marginTop = '1rem';
    
    Object.entries(platformLinks).forEach(([platform, url]) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.className = 'platform-link';
        link.innerHTML = getPlatformIcon(platform) + ' ' + getPlatformName(platform);
        linksGrid.appendChild(link);
    });
    
    linksContainer.appendChild(linksGrid);
    content.appendChild(linksContainer);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add YouTube results display
function addYouTubeResults(results) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fab fa-youtube"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'youtube-results';
    
    results.slice(0, 5).forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'youtube-item';
        resultDiv.onclick = () => playYouTubeVideo(result);
        
        resultDiv.innerHTML = `
            <div class="youtube-title">${result.title}</div>
            <div class="youtube-channel">${result.channelTitle}</div>
            <div class="youtube-duration">${result.duration || 'N/A'}</div>
        `;
        
        resultsContainer.appendChild(resultDiv);
    });
    
    content.appendChild(resultsContainer);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Helper functions for platform names and icons
function getPlatformName(platform) {
    const names = {
        youtube: 'YouTube',
        spotify: 'Spotify',
        appleMusic: 'Apple Music',
        amazonMusic: 'Amazon Music',
        jiosaavn: 'JioSaavn',
        gaana: 'Gaana',
        wynk: 'Wynk Music'
    };
    return names[platform] || platform;
}

function getPlatformIcon(platform) {
    const icons = {
        youtube: '<i class="fab fa-youtube" style="color: #FF0000;"></i>',
        spotify: '<i class="fab fa-spotify" style="color: #1DB954;"></i>',
        appleMusic: '<i class="fab fa-apple" style="color: #FA243C;"></i>',
        amazonMusic: '<i class="fab fa-amazon" style="color: #FF9900;"></i>',
        jiosaavn: '<i class="fas fa-music" style="color: #FF6600;"></i>',
        gaana: '<i class="fas fa-music" style="color: #FF4500;"></i>',
        wynk: '<i class="fas fa-music" style="color: #FF9500;"></i>'
    };
    return icons[platform] || '<i class="fas fa-music"></i>';
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
        
        // Play next song after 30 seconds (simulated)
        setTimeout(() => {
            playNextSong();
        }, 30000);
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
        jiosaavn: `https://www.jiosaavn.com/search/${encodeURIComponent(searchQuery)}`,
        gaana: `https://gaana.com/search/${encodeURIComponent(searchQuery)}`,
        wynk: `https://wynk.in/music/search?q=${encodeURIComponent(searchQuery)}`
    };
}

// Play YouTube video
function playYouTubeVideo(video) {
    const player = document.getElementById('youtubePlayer');
    const nowPlaying = document.getElementById('nowPlaying');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    
    const videoId = video.videoId || extractVideoId(video.url);
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        player.style.display = 'block';
        nowPlaying.style.display = 'block';
        
        songTitle.textContent = video.title;
        songArtist.textContent = video.channelTitle;
    }
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

socket.on('connect', () => {
    console.log('Connected to MoodTunes server');
});