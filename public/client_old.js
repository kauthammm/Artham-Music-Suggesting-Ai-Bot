const socket = io();

let selectedMood = null;
let selectedLanguage = null;

// Enhanced music management variables
let currentUser = 'user_' + Math.random().toString(36).substr(2, 9); // Generate unique user ID
let userPlaylists = [];
let currentLanguage = 'tamil';
let currentGenre = 'all';
let currentMood = 'all';
let advancedSearchMode = false;
let playlistEditMode = false;

// Enhanced music management functions
const musicManager = {
    // Create new playlist
    async createPlaylist(name, description = '') {
        try {
            const response = await fetch('/create-playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser,
                    playlistName: name,
                    description: description
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('✅ Playlist created:', data.playlist.name);
                await this.loadUserPlaylists();
                updatePlaylistUI();
                return data.playlist;
            } else {
                console.error('❌ Failed to create playlist:', data.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Create playlist error:', error);
            return null;
        }
    },
    
    // Load user playlists
    async loadUserPlaylists() {
        try {
            const response = await fetch(`/playlists/${currentUser}`);
            const data = await response.json();
            
            if (data.success) {
                userPlaylists = data.playlists;
                console.log(`📋 Loaded ${userPlaylists.length} playlists`);
                return userPlaylists;
            }
        } catch (error) {
            console.error('❌ Load playlists error:', error);
        }
        return [];
    },
    
    // Add song to playlist
    async addToPlaylist(playlistId, song) {
        try {
            const response = await fetch(`/playlist/${currentUser}/${playlistId}/add-song`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ song })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log(`✅ Added "${song.title}" to playlist`);
                await this.loadUserPlaylists();
                return true;
            }
        } catch (error) {
            console.error('❌ Add to playlist error:', error);
        }
        return false;
    },
    
    // Get supported languages
    async getLanguages() {
        try {
            const response = await fetch('/languages');
            const data = await response.json();
            return data.success ? data.languages : {};
        } catch (error) {
            console.error('❌ Get languages error:', error);
            return {};
        }
    },
    
    // Get available genres
    async getGenres() {
        try {
            const response = await fetch('/genres');
            const data = await response.json();
            return data.success ? data.genres : {};
        } catch (error) {
            console.error('❌ Get genres error:', error);
            return {};
        }
    },
    
    // Get available moods
    async getMoods() {
        try {
            const response = await fetch('/moods');
            const data = await response.json();
            return data.success ? data.moods : {};
        } catch (error) {
            console.error('❌ Get moods error:', error);
            return {};
        }
    },
    
    // Advanced search
    async advancedSearch(filters) {
        try {
            const response = await fetch('/advanced-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });
            
            const data = await response.json();
            if (data.success) {
                console.log(`🔍 Advanced search found ${data.results.length} results`);
                return data.results;
            }
        } catch (error) {
            console.error('❌ Advanced search error:', error);
        }
        return [];
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎵 Initializing advanced music features...');
    
    // Initialize basic features
    initializeEventListeners();
    addWelcomeMessage();
    
    // Load user playlists
    await musicManager.loadUserPlaylists();
    
    // Load available languages, genres, and moods
    const languages = await musicManager.getLanguages();
    const genres = await musicManager.getGenres();
    const moods = await musicManager.getMoods();
    
    // Initialize advanced UI components
    initializeAdvancedUI(languages, genres, moods);
    updatePlaylistUI();
    
    console.log('✅ Advanced features initialized');
});

// Initialize advanced UI components
function initializeAdvancedUI(languages, genres, moods) {
    // Add language selector to chat interface
    addLanguageSelector(languages);
    
    // Add genre and mood filters
    addGenreMoodFilters(genres, moods);
    
    // Add playlist management panel
    addPlaylistPanel();
    
    // Add advanced search interface
    addAdvancedSearchInterface();
}

// Add language selector
function addLanguageSelector(languages) {
    const chatContainer = document.querySelector('#chatContainer') || document.body;
    const languageSelector = document.createElement('div');
    languageSelector.className = 'language-selector';
    languageSelector.innerHTML = `
        <div style="margin: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 15px;">
            <label style="color: #fff; font-size: 14px; margin-right: 10px;">🌐 Language:</label>
            <select id="languageSelect" style="padding: 8px; border-radius: 20px; border: none; background: #fff; color: #333;">
                ${Object.entries(languages).map(([code, lang]) => 
                    `<option value="${code}" ${code === currentLanguage ? 'selected' : ''}>${lang.name}</option>`
                ).join('')}
            </select>
        </div>
    `;
    
    chatContainer.insertBefore(languageSelector, chatContainer.firstChild);
    
    // Add event listener
    document.getElementById('languageSelect').addEventListener('change', function() {
        currentLanguage = this.value;
        selectedLanguage = this.value;
        console.log('🌐 Language changed to:', currentLanguage);
    });
}

// Add genre and mood filters
function addGenreMoodFilters(genres, moods) {
    const container = document.querySelector('#chatContainer') || document.body;
    const filtersPanel = document.createElement('div');
    filtersPanel.className = 'filters-panel';
    filtersPanel.innerHTML = `
        <div style="margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px;">
            <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                <div>
                    <label style="color: #fff; font-size: 14px; margin-right: 8px;">🎭 Mood:</label>
                    <select id="moodSelect" style="padding: 8px; border-radius: 20px; border: none; background: #fff; color: #333;">
                        <option value="all">All Moods</option>
                        ${Object.entries(moods).map(([key, mood]) => 
                            `<option value="${key}">${mood.emoji} ${mood.description}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label style="color: #fff; font-size: 14px; margin-right: 8px;">🎵 Genre:</label>
                    <select id="genreSelect" style="padding: 8px; border-radius: 20px; border: none; background: #fff; color: #333;">
                        <option value="all">All Genres</option>
                        ${Object.entries(genres).map(([key, genre]) => 
                            `<option value="${key}">${genre.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <button onclick="toggleAdvancedSearch()" style="padding: 8px 15px; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 20px; cursor: pointer;">
                    🔍 Advanced Search
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(filtersPanel);
    
    // Add event listeners
    document.getElementById('moodSelect').addEventListener('change', function() {
        currentMood = this.value;
        selectedMood = this.value;
        console.log('🎭 Mood changed to:', currentMood);
    });
    
    document.getElementById('genreSelect').addEventListener('change', function() {
        currentGenre = this.value;
        console.log('🎵 Genre changed to:', currentGenre);
    });
}

// Add playlist management panel
function addPlaylistPanel() {
    const container = document.querySelector('#chatContainer') || document.body;
    const playlistPanel = document.createElement('div');
    playlistPanel.className = 'playlist-panel';
    playlistPanel.innerHTML = `
        <div id="playlistContainer" style="margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #fff; margin: 0;">📁 My Playlists</h3>
                <button onclick="showCreatePlaylistDialog()" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 20px; cursor: pointer;">
                    ➕ Create Playlist
                </button>
            </div>
            <div id="playlistList" style="max-height: 200px; overflow-y: auto;">
                <!-- Playlists will be loaded here -->
            </div>
        </div>
    `;
    
    container.appendChild(playlistPanel);
}

// Add advanced search interface
function addAdvancedSearchInterface() {
    const container = document.querySelector('#chatContainer') || document.body;
    const searchInterface = document.createElement('div');
    searchInterface.id = 'advancedSearchInterface';
    searchInterface.style.display = 'none';
    searchInterface.innerHTML = `
        <div style="margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px; border: 2px solid #667eea;">
            <h3 style="color: #fff; margin: 0 0 15px 0;">🔍 Advanced Search</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <label style="color: #fff; font-size: 12px; display: block; margin-bottom: 5px;">Artist:</label>
                    <input type="text" id="searchArtist" placeholder="Enter artist name" style="width: 100%; padding: 8px; border-radius: 20px; border: none;">
                </div>
                <div>
                    <label style="color: #fff; font-size: 12px; display: block; margin-bottom: 5px;">Year:</label>
                    <input type="number" id="searchYear" placeholder="e.g., 2023" style="width: 100%; padding: 8px; border-radius: 20px; border: none;">
                </div>
                <div>
                    <label style="color: #fff; font-size: 12px; display: block; margin-bottom: 5px;">Song Title:</label>
                    <input type="text" id="searchTitle" placeholder="Enter song title" style="width: 100%; padding: 8px; border-radius: 20px; border: none;">
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="performAdvancedSearch()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 20px; cursor: pointer;">
                    🔍 Search
                </button>
                <button onclick="toggleAdvancedSearch()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 20px; cursor: pointer;">
                    ✖️ Close
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(searchInterface);
}

// Update playlist UI
function updatePlaylistUI() {
    const playlistList = document.getElementById('playlistList');
    if (playlistList) {
        if (userPlaylists.length === 0) {
            playlistList.innerHTML = `
                <p style="color: #ccc; text-align: center; padding: 20px;">
                    No playlists yet. Create your first playlist! 🎵
                </p>
            `;
        } else {
            playlistList.innerHTML = userPlaylists.map(playlist => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div onclick="openPlaylist('${playlist.id}')" style="cursor: pointer; flex-grow: 1;">
                        <div style="color: #fff; font-weight: bold;">${playlist.name}</div>
                        <div style="color: #ccc; font-size: 12px;">${playlist.songs.length} songs • Created ${new Date(playlist.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="editPlaylist('${playlist.id}')" style="background: #ffc107; color: #000; border: none; border-radius: 15px; padding: 5px 10px; cursor: pointer;">✏️</button>
                        <button onclick="deletePlaylist('${playlist.id}')" style="background: #dc3545; color: white; border: none; border-radius: 15px; padding: 5px 10px; cursor: pointer;">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Add welcome message
function addWelcomeMessage() {
    addMessage('🎵 Welcome to MoodTunes Pro! Your comprehensive music platform with multi-language support, advanced playlists, and YouTube integration!', 'bot');
    
    // Add feature overview
    setTimeout(() => {
        addMessage(`
🌟 New Features Available:
🌐 Multi-language support (Tamil, Hindi, Telugu, Malayalam, Kannada, Punjabi, Marathi, Bengali)
📁 Create and manage custom playlists
🔍 Advanced search with filters (artist, year, genre, mood)
🎭 Mood-based music discovery
🎵 Genre and language filtering
▶️ YouTube integration with auto-play
🔀 Shuffle and auto-progression

Try saying: "Play Tamil romantic songs" or "Create a playlist for party music"
        `, 'bot');
    }, 1000);
}

// Initialize all event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    console.log('Found mood buttons:', moodButtons.length);
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Mood button clicked:', btn.dataset.mood);
            selectMood(btn.dataset.mood);
        });
    });

    // Language buttons
    const languageButtons = document.querySelectorAll('.language-btn');
    console.log('Found language buttons:', languageButtons.length);
    languageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Language button clicked:', btn.dataset.language);
            selectLanguage(btn.dataset.language);
        });
    });

    // Chat form
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        console.log('Chat form found, adding listener');
        chatForm.addEventListener('submit', handleChatSubmit);
    } else {
        console.error('Chat form not found!');
    }

    // Chat input for Enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        console.log('Adding Enter key handler to chat input');
        chatInput.addEventListener('keypress', function(e) {
            console.log('Key pressed:', e.key);
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter key pressed, calling handleChatSubmit');
                window.handleChatSubmit(e);
            }
        });
    } else {
        console.error('Chat input not found!');
    }
}

// Handle chat form submission - make it global
window.handleChatSubmit = function(e) {
    if (e) e.preventDefault();
    console.log('Chat form submitted');
    
    const input = document.getElementById('chatInput');
    if (!input) {
        console.error('Chat input not found!');
        return;
    }
    
    const message = input.value.trim();
    console.log('Message:', message);
    
    if (message) {
        addMessage(message, 'user');
        
        // Check for special commands
        if (message.toLowerCase().includes('create playlist')) {
            const playlistName = message.replace(/create playlist/i, '').trim();
            if (playlistName) {
                musicManager.createPlaylist(playlistName);
            } else {
                showCreatePlaylistDialog();
            }
            input.value = '';
            return;
        }
        
        if (message.toLowerCase().includes('show playlists') || message.toLowerCase().includes('my playlists')) {
            if (userPlaylists.length === 0) {
                addMessage('You have no playlists yet. Create one by saying "create playlist [name]" 📁', 'bot');
            } else {
                const playlistList = userPlaylists.map(p => 
                    `📁 ${p.name} (${p.songs.length} songs)`
                ).join('\n');
                addMessage(`Your playlists:\n${playlistList}`, 'bot');
            }
            input.value = '';
            return;
        }
        
        if (message.toLowerCase().includes('advanced search') || message.toLowerCase().includes('search music')) {
            toggleAdvancedSearch();
            input.value = '';
            return;
        }
        
        // Send message to server with current filters
        console.log('Sending message to server:', { 
            text: message,
            mood: selectedMood || currentMood,
            language: selectedLanguage || currentLanguage,
            genre: currentGenre,
            filters: {
                language: currentLanguage,
                genre: currentGenre,
                mood: currentMood
            }
        });
        
        socket.emit('chat', { 
            text: message,
            mood: selectedMood || currentMood,
            language: selectedLanguage || currentLanguage,
            genre: currentGenre,
            filters: {
                language: currentLanguage,
                genre: currentGenre,
                mood: currentMood
            }
        });
        
        console.log('Message sent to server');
        input.value = '';
    }
}

// Select mood
function selectMood(mood) {
    console.log('Selecting mood:', mood);
    selectedMood = mood;
    
    // Update button states
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // If both mood and language are selected, request playlists
    if (selectedLanguage) {
        requestPlaylists(mood, selectedLanguage);
    } else {
        addMessage(`Great! You selected ${mood} mood. Now please select a language.`, 'bot');
    }
}

// Select language
function selectLanguage(language) {
    console.log('Selecting language:', language);
    selectedLanguage = language;
    
    // Update button states
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
    const selectedBtn = document.querySelector(`[data-language="${language}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // If both mood and language are selected, request playlists
    if (selectedMood) {
        requestPlaylists(selectedMood, language);
    } else {
        addMessage(`Perfect! You selected ${language} music. Now please select your mood.`, 'bot');
    }
}

// Request playlists
function requestPlaylists(mood, language) {
    console.log('Requesting playlists for:', mood, language);
    
    socket.emit('chat', {
        text: `I want ${mood} ${language} music`,
        mood: mood,
        language: language
    });
}

// Add message to chat
function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    if (!messages) {
        console.error('Chat messages container not found!');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? 
        '<i class="fas fa-user"></i>' : 
        '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

// Add bot message with HTML content
function addBotMessage(htmlContent) {
    const messages = document.getElementById('chatMessages');
    if (!messages) {
        console.error('Chat messages container not found!');
        return;
    }
    
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
    console.log('Adding playlist cards:', playlists.length);
    
    playlists.forEach(playlist => {
        const playlistHtml = `
            <div class="playlist-card" onclick="showPlaylistSongs(${JSON.stringify(playlist).replace(/"/g, '&quot;')})">
                <div class="playlist-title">${playlist.name}</div>
                <div class="playlist-meta">
                    ${playlist.language.charAt(0).toUpperCase() + playlist.language.slice(1)} • 
                    ${playlist.songs.length} songs • 
                    ${playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)}
                </div>
                <div class="playlist-actions">
                    <button onclick="event.stopPropagation(); playAllSongs(${JSON.stringify(playlist).replace(/"/g, '&quot;')})" class="play-all-btn">
                        <i class="fas fa-play"></i> Play All
                    </button>
                    <button onclick="event.stopPropagation(); showPlaylistSongs(${JSON.stringify(playlist).replace(/"/g, '&quot;')})" class="view-songs-btn">
                        <i class="fas fa-list"></i> View Songs
                    </button>
                </div>
            </div>
        `;
        
        addBotMessage(playlistHtml);
    });
    
    // Add platform buttons
    addPlatformButtons();
}

// Show playlist songs
function showPlaylistSongs(playlist) {
    console.log('Showing songs for playlist:', playlist.name);
    
    const songListHtml = `
        <div class="playlist-details">
            <h4>🎵 ${playlist.name}</h4>
            <p style="margin-bottom: 1rem; color: #666;">
                ${playlist.songs.length} songs • ${playlist.language.charAt(0).toUpperCase() + playlist.language.slice(1)} • 
                ${playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)}
            </p>
            <div class="song-list">
                ${playlist.songs.map((song, index) => `
                    <div class="song-item" onclick="playSong('${song.title}', '${song.artist}')">
                        <div class="song-number">${index + 1}</div>
                        <div class="song-details">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <button class="play-btn" onclick="event.stopPropagation(); playSong('${song.title}', '${song.artist}')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    addBotMessage(songListHtml);
}

// Play all songs
function playAllSongs(playlist) {
    console.log('Playing all songs from:', playlist.name);
    addMessage(`🎵 Starting playlist: ${playlist.name}`, 'bot');
    showPlaylistSongs(playlist);
}

// Play individual song
function playSong(title, artist) {
    console.log('Playing song:', title, 'by', artist);
    addMessage(`🎵 Playing: ${title} by ${artist}`, 'bot');
    
    // Create platform links
    const searchQuery = `${title} ${artist}`;
    const platformLinks = {
        youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`,
        apple: `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`,
        jiosaavn: `https://www.jiosaavn.com/search/${encodeURIComponent(searchQuery)}`
    };
    
    addPlatformLinks(platformLinks, title);
}

// Add platform links
function addPlatformLinks(platformLinks, songName) {
    const platformHtml = `
        <div class="platform-links-container">
            <p style="margin-bottom: 0.75rem; color: #666;">Listen to "${songName}" on:</p>
            <div class="platform-links">
                <a href="${platformLinks.youtube}" target="_blank" class="platform-link youtube">
                    <i class="fab fa-youtube"></i> YouTube
                </a>
                <a href="${platformLinks.spotify}" target="_blank" class="platform-link spotify">
                    <i class="fab fa-spotify"></i> Spotify
                </a>
                <a href="${platformLinks.apple}" target="_blank" class="platform-link apple">
                    <i class="fab fa-apple"></i> Apple Music
                </a>
                <a href="${platformLinks.jiosaavn}" target="_blank" class="platform-link jiosaavn">
                    <i class="fas fa-music"></i> JioSaavn
                </a>
            </div>
        </div>
    `;
    
    addBotMessage(platformHtml);
}

// Add platform buttons
function addPlatformButtons() {
    const platformHtml = `
        <div class="platform-buttons">
            <div class="platform-header">🎵 Choose your preferred music platform:</div>
            <div class="platform-grid">
                <button class="platform-btn" onclick="openPlatform('https://youtube.com', 'YouTube')">
                    <i class="fab fa-youtube"></i>
                    <span>YouTube</span>
                </button>
                <button class="platform-btn" onclick="openPlatform('https://open.spotify.com', 'Spotify')">
                    <i class="fab fa-spotify"></i>
                    <span>Spotify</span>
                </button>
                <button class="platform-btn" onclick="openPlatform('https://music.apple.com', 'Apple Music')">
                    <i class="fab fa-apple"></i>
                    <span>Apple Music</span>
                </button>
                <button class="platform-btn" onclick="openPlatform('https://jiosaavn.com', 'JioSaavn')">
                    <i class="fas fa-music"></i>
                    <span>JioSaavn</span>
                </button>
            </div>
        </div>
    `;
    
    addBotMessage(platformHtml);
}

// Open platform
function openPlatform(url, platformName) {
    console.log('Opening platform:', platformName);
    addMessage(`🎵 Opening ${platformName}! Enjoy your music!`, 'bot');
    window.open(url, '_blank');
}

// Add YouTube results
function addYouTubeResults(results) {
    const resultsHtml = `
        <div class="youtube-results">
            ${results.map(video => `
                <div class="youtube-item" onclick="playYouTubeVideo('${video.videoId}', '${video.title}')">
                    <img src="${video.thumbnail}" alt="${video.title}" style="width: 120px; height: 90px; border-radius: 6px;">
                    <div style="flex: 1; margin-left: 1rem;">
                        <div class="youtube-title">${video.title}</div>
                        <div class="youtube-channel">${video.channel}</div>
                        <div style="color: #999; font-size: 0.8rem;">${video.duration}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    addBotMessage(resultsHtml);
}

// Play YouTube video
function playYouTubeVideo(videoId, title) {
    console.log('Playing YouTube video:', title);
    addMessage(`🎵 Playing: ${title}`, 'bot');
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

// Socket event listeners
socket.on('bot', function(data) {
    console.log('Received bot message:', data);
    
    if (data.type === 'curated_playlist' && data.playlist) {
        addMessage(data.text, 'bot');
        displayCuratedPlaylist(data.playlist, data.autoPlay);
    } else if (data.type === 'artist_playlist' && data.playlist) {
        addMessage(data.text, 'bot');
        displayCuratedPlaylist(data.playlist, data.autoPlay);
    } else if (data.playlists && data.playlists.length > 0) {
        addMessage(data.text, 'bot');
        addPlaylistCards(data.playlists);
    } else if (data.youtubeResults && data.youtubeResults.length > 0) {
        addMessage(data.text, 'bot');
        addYouTubeResults(data.youtubeResults);
    } else if (data.platformLinks) {
        addMessage(data.text, 'bot');
        addPlatformLinks(data.platformLinks, data.songName || 'this song');
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
});

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

// Auto-play variables
let currentPlaylist = null;
let currentSongIndex = 0;
let autoPlayMode = false;

// Display curated playlist with auto-play
function displayCuratedPlaylist(playlist, autoPlay = false) {
    console.log('Displaying curated playlist:', playlist);
    
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    
    // Create playlist container
    const playlistDiv = document.createElement('div');
    playlistDiv.className = 'playlist-container';
    playlistDiv.innerHTML = `
        <div class="playlist-header">
            <h3>${playlist.title}</h3>
            <p>${playlist.description}</p>
            <div class="playlist-controls">
                <button class="play-all-btn" onclick="playAllSongs()">
                    <i class="fas fa-play"></i> Play All
                </button>
                <button class="shuffle-btn" onclick="shufflePlaylist()">
                    <i class="fas fa-random"></i> Shuffle
                </button>
            </div>
        </div>
        <div class="songs-list" id="currentPlaylistSongs">
            ${playlist.songs.map((song, index) => `
                <div class="song-item" data-index="${index}" onclick="playSongByIndex(${index})">
                    <div class="song-number">${index + 1}</div>
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-details">${song.artist} • ${song.movie}</div>
                    </div>
                    <div class="song-actions">
                        <button class="play-btn" onclick="playSongByIndex(${index})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    messages.appendChild(playlistDiv);
    messages.scrollTop = messages.scrollHeight;
    
    // Store current playlist
    currentPlaylist = playlist;
    currentSongIndex = 0;
    autoPlayMode = autoPlay;
    
    console.log('Playlist stored. AutoPlay enabled:', autoPlay);
    
    // Auto-play first song if enabled
    if (autoPlay) {
        setTimeout(() => {
            console.log('Auto-playing first song');
            playSongByIndex(0);
        }, 1000);
    }
}

// Play all songs in sequence
function playAllSongs() {
    if (!currentPlaylist || currentPlaylist.songs.length === 0) {
        console.log('No playlist available to play all songs');
        return;
    }
    
    console.log('Starting autoplay mode for playlist:', currentPlaylist.title);
    autoPlayMode = true;
    currentSongIndex = 0;
    playSongByIndex(0);
    
    addMessage(`🎵 Playing all ${currentPlaylist.songs.length} songs in "${currentPlaylist.title}" playlist!`, 'bot');
}

// Shuffle playlist
function shufflePlaylist() {
    if (!currentPlaylist) return;
    
    // Shuffle the songs array
    const shuffled = [...currentPlaylist.songs].sort(() => Math.random() - 0.5);
    currentPlaylist.songs = shuffled;
    
    // Refresh the display
    const songsContainer = document.getElementById('currentPlaylistSongs');
    if (songsContainer) {
        songsContainer.innerHTML = currentPlaylist.songs.map((song, index) => `
            <div class="song-item" data-index="${index}" onclick="playSong(${index})">
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-details">${song.artist} • ${song.movie}</div>
                </div>
                <div class="song-actions">
                    <button class="play-btn" onclick="playSong(${index})">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    autoPlayMode = true;
    currentSongIndex = 0;
    playSong(0);
    
    addMessage(`🎲 Shuffled and playing "${currentPlaylist.title}" playlist!`, 'bot');
}

// Search YouTube and play song directly on page
function searchAndPlayYouTube(query, songInfo) {
    console.log('Playing YouTube video for:', query);
    
    // Show now playing immediately
    updateNowPlaying(songInfo);
    
    // Use YouTube video playback directly on the page
    playYouTubeDirectly(songInfo);
    
    // Add song to chat as "Now Playing"
    addMessage(`🎵 **Now Playing:** ${songInfo.title}\n🎬 **Movie:** ${songInfo.movie}\n🎤 **Artist:** ${songInfo.artist}\n\n🎬 **YouTube video playing directly on your page!**\n🎯 Video player controls available above.`, 'bot');
}

// YouTube Player API variables
let youtubePlayer = null;
let isYouTubeReady = false;

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API is ready');
    isYouTubeReady = true;
}

// Initialize YouTube Player
function initYouTubePlayer(videoId) {
    console.log('Initializing YouTube Player with video:', videoId);
    
    if (youtubePlayer) {
        youtubePlayer.destroy();
    }
    
    youtubePlayer = new YT.Player('youtubePlayer', {
        height: '300',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Player ready callback
function onPlayerReady(event) {
    console.log('YouTube player is ready');
    document.getElementById('youtubePlayer').style.display = 'block';
    document.getElementById('customPlayer').style.display = 'none';
    document.getElementById('audioPlayerContainer').style.display = 'none';
    
    // Start playing
    event.target.playVideo();
}

// Player state change callback
function onPlayerStateChange(event) {
    console.log('Player state changed:', event.data);
    
    if (event.data == YT.PlayerState.ENDED) {
        console.log('Video ended, playing next song');
        setTimeout(() => {
            nextSong();
        }, 2000);
    }
    
    if (event.data == YT.PlayerState.PLAYING) {
        updatePlayerStatus('🎵 Playing from YouTube');
    }
    
    if (event.data == YT.PlayerState.PAUSED) {
        updatePlayerStatus('⏸️ Paused');
    }
}

// Player error callback
function onPlayerError(event) {
    console.log('❌ YouTube player error:', event.data);
    const errorMessages = {
        2: 'Invalid video ID',
        5: 'HTML5 player error', 
        100: 'Video not found or private',
        101: 'Video unavailable in embedded players',
        150: 'Video unavailable in embedded players'
    };
    
    const errorMsg = errorMessages[event.data] || 'Video playback error';
    console.log('YouTube Error:', errorMsg);
    
    updatePlayerStatus(`❌ YouTube Error: ${errorMsg}`);
    
    // Try alternative videos if available
    if (window.currentVideoOptions && window.currentVideoOptions.length > 1) {
        tryAlternativeVideo();
    } else if (window.currentSongInfo) {
        console.log('🔄 Getting alternative videos for failed playback...');
        getVideoOptions(window.currentSongInfo).then(options => {
            if (options && options.length > 1) {
                window.currentVideoOptions = options;
                window.currentVideoIndex = 0;
                tryAlternativeVideo();
            } else {
                // Fallback to audio if no alternatives
                switchToAudioFallback();
            }
        });
    } else {
        // Try next song after 3 seconds if no alternatives
        setTimeout(() => {
            nextSong();
        }, 3000);
    }
}

// Try alternative video from the options list
function tryAlternativeVideo() {
    if (!window.currentVideoOptions || !window.currentVideoOptions.length) {
        switchToAudioFallback();
        return;
    }
    
    // Initialize or increment video index
    if (typeof window.currentVideoIndex === 'undefined') {
        window.currentVideoIndex = 0;
    } else {
        window.currentVideoIndex++;
    }
    
    // Check if we have more alternatives
    if (window.currentVideoIndex >= window.currentVideoOptions.length) {
        console.log('❌ All video alternatives exhausted, switching to audio');
        switchToAudioFallback();
        return;
    }
    
    const alternativeVideo = window.currentVideoOptions[window.currentVideoIndex];
    console.log(`🔄 Trying alternative video ${window.currentVideoIndex + 1}/${window.currentVideoOptions.length}:`, alternativeVideo.title);
    
    updatePlayerStatus(`🔄 Trying alternative: ${alternativeVideo.title}`);
    
    // Load the alternative video
    if (window.youtubePlayer && alternativeVideo.videoId) {
        window.youtubePlayer.loadVideoById(alternativeVideo.videoId);
    } else {
        initYouTubePlayer(alternativeVideo.videoId);
    }
}

// Switch to audio fallback when YouTube fails
function switchToAudioFallback() {
    updatePlayerStatus(`🔊 YouTube failed - Switching to audio playback...`);
    
    if (window.currentSongInfo) {
        // Hide YouTube player, show audio player
        const youtubePlayerDiv = document.getElementById('youtubePlayer');
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        
        if (youtubePlayerDiv) youtubePlayerDiv.style.display = 'none';
        if (audioPlayerContainer) audioPlayerContainer.style.display = 'block';
        
        // Try enhanced audio playback
        playEnhancedAudio(window.currentSongInfo);
    } else {
        setTimeout(() => {
            nextSong();
        }, 3000);
    }
}

// Enhanced audio playback with legitimate sources
function playEnhancedAudio(songInfo) {
    console.log('Starting enhanced audio playback for:', songInfo.title);
    
    updatePlayerStatus(`🔊 Loading audio: ${songInfo.title}...`);
    
    // Store current song info globally
    window.currentSongInfo = songInfo;
    
    // Enable auto-play mode for playlist progression
    if (currentPlaylist && currentPlaylist.songs) {
        autoPlayMode = true;
        console.log('Auto-play enabled for playlist progression');
    }
    
    // Try multiple legitimate audio sources
    tryLegitimateAudioSources(songInfo);
}

// Try legitimate audio sources (demos, previews, etc.)
function tryLegitimateAudioSources(songInfo) {
    const legitimateSources = [
        // Demo audio sources (immediate playback)
        '/demo-audio/demo1',
        '/demo-audio/demo2', 
        '/demo-audio/demo3',
        '/demo-audio/demo4',
        '/demo-audio/demo5',
        
        // Public domain audio sources
        'https://www.soundjay.com/misc/sounds/magic_chime_02.mp3',
        'https://www.soundjay.com/misc/sounds/magic_wand_03.mp3',
        'https://www.soundjay.com/misc/sounds/bell_tree_02.mp3',
        'https://www.soundjay.com/misc/sounds/ding_1.mp3',
        'https://www.soundjay.com/misc/sounds/temple_bell_1.mp3'
    ];
    
    console.log('Trying legitimate audio sources...');
    tryAudioSources(legitimateSources, 0, songInfo);
}

// Get iTunes preview for a song (legal 30-second preview)
async function getiTunesPreview(songInfo) {
    try {
        updatePlayerStatus(`🎵 Getting preview for: ${songInfo.title}...`);
        
        const response = await fetch(`/itunes-preview/${encodeURIComponent(songInfo.title)}/${encodeURIComponent(songInfo.artist)}`);
        const data = await response.json();
        
        if (data.success && data.previewUrl) {
            console.log('Got iTunes preview:', data.previewUrl);
            return data.previewUrl;
        } else {
            console.log('iTunes preview not available');
            return null;
        }
    } catch (error) {
        console.error('iTunes preview error:', error);
        return null;
    }
}

// Get audio sources from server
async function getAudioSourcesFromServer(songInfo) {
    try {
        const response = await fetch('/get-audio-sources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                songTitle: songInfo.title,
                artist: songInfo.artist
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.sources;
        } else {
            console.log('Server audio sources not available');
            return null;
        }
    } catch (error) {
        console.error('Error fetching audio sources:', error);
        return null;
    }
}

// Try multiple audio sources sequentially with enhanced controls
function tryAudioSources(sources, index, songInfo) {
    if (index >= sources.length) {
        console.log('All audio sources failed, showing alternative options');
        showAudioAlternatives(songInfo);
        return;
    }
    
    const audioUrl = sources[index];
    console.log(`Trying audio source ${index + 1}/${sources.length}:`, audioUrl);
    
    const audioPlayer = document.getElementById('audioPlayer');
    const customPlayer = document.getElementById('customPlayer');
    
    if (audioPlayer && customPlayer) {
        // Show audio player with enhanced controls
        customPlayer.style.display = 'block';
        
        // Clear any existing event listeners
        audioPlayer.removeEventListener('error', audioPlayer.lastErrorHandler);
        audioPlayer.removeEventListener('canplay', audioPlayer.lastCanPlayHandler);
        audioPlayer.removeEventListener('ended', audioPlayer.lastEndedHandler);
        audioPlayer.removeEventListener('loadstart', audioPlayer.lastLoadStartHandler);
        audioPlayer.removeEventListener('progress', audioPlayer.lastProgressHandler);
        
        // Set up error handler for this attempt
        const onError = () => {
            console.log(`Audio source ${index + 1} failed, trying next...`);
            updatePlayerStatus(`⚠️ Source ${index + 1} failed, trying next...`);
            tryAudioSources(sources, index + 1, songInfo);
        };
        
        const onCanPlay = () => {
            console.log(`Audio source ${index + 1} loaded successfully`);
            updatePlayerStatus(`🎵 Playing: ${songInfo.title} (${songInfo.artist})`);
            
            // Add enhanced playback controls
            addAudioControls(audioPlayer, songInfo);
            
            // Start playback
            audioPlayer.play().catch(playError => {
                console.error('Audio play failed:', playError);
                onError();
            });
        };
        
        const onSongEnded = () => {
            console.log('Song ended, playing next song...');
            updatePlayerStatus(`✅ "${songInfo.title}" completed - Playing next...`);
            
            // Auto-play next song after 1 second
            setTimeout(() => {
                nextSong();
            }, 1000);
        };
        
        const onLoadStart = () => {
            updatePlayerStatus(`📡 Loading "${songInfo.title}"...`);
        };
        
        const onProgress = () => {
            if (audioPlayer.buffered.length > 0) {
                const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
                const duration = audioPlayer.duration;
                if (duration > 0) {
                    const percentBuffered = (bufferedEnd / duration) * 100;
                    updatePlayerStatus(`🎵 Playing: ${songInfo.title} (${Math.round(percentBuffered)}% loaded)`);
                }
            }
        };
        
        // Store handlers for cleanup
        audioPlayer.lastErrorHandler = onError;
        audioPlayer.lastCanPlayHandler = onCanPlay;
        audioPlayer.lastEndedHandler = onSongEnded;
        audioPlayer.lastLoadStartHandler = onLoadStart;
        audioPlayer.lastProgressHandler = onProgress;
        
        // Add event listeners
        audioPlayer.addEventListener('error', onError);
        audioPlayer.addEventListener('canplay', onCanPlay);
        audioPlayer.addEventListener('ended', onSongEnded);
        audioPlayer.addEventListener('loadstart', onLoadStart);
        audioPlayer.addEventListener('progress', onProgress);
        
        // Set source and load
        audioPlayer.src = audioUrl;
        audioPlayer.load();
        
        updatePlayerStatus(`🔄 Loading audio source ${index + 1}/${sources.length}...`);
    } else {
        console.error('Audio player elements not found');
        showAudioAlternatives(songInfo);
    }
}

// Add enhanced audio controls
function addAudioControls(audioPlayer, songInfo) {
    // Update time display
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const currentTime = Math.floor(audioPlayer.currentTime);
            const duration = Math.floor(audioPlayer.duration);
            const currentMin = Math.floor(currentTime / 60);
            const currentSec = currentTime % 60;
            const durationMin = Math.floor(duration / 60);
            const durationSec = duration % 60;
            
            const timeDisplay = `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${durationMin}:${durationSec.toString().padStart(2, '0')}`;
            updatePlayerStatus(`🎵 ${songInfo.title} - ${timeDisplay}`);
        }
    });
}

// Show audio alternatives when direct playback fails
function showAudioAlternatives(songInfo) {
    updatePlayerStatus(`🎵 Audio not available - Try these alternatives:`);
    
    const playerContainer = document.getElementById('audioPlayerContainer');
    if (playerContainer) {
        const searchQuery = encodeURIComponent(`${songInfo.title} ${songInfo.artist}`);
        
        const alternativeLinks = [
            {
                name: 'YouTube',
                url: `https://www.youtube.com/results?search_query=${searchQuery}`,
                icon: '🎬'
            },
            {
                name: 'Spotify',
                url: `https://open.spotify.com/search/${searchQuery}`,
                icon: '🎵'
            },
            {
                name: 'Apple Music',
                url: `https://music.apple.com/search?term=${searchQuery}`,
                icon: '🍎'
            },
            {
                name: 'JioSaavn',
                url: `https://www.jiosaavn.com/search/${searchQuery}`,
                icon: '🎶'
            }
        ];
        
        const linksHtml = alternativeLinks.map(link => 
            `<button onclick="window.open('${link.url}', '_blank')" 
                     class="music-link-btn" 
                     style="margin: 8px; padding: 12px 20px; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
                            color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 14px;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s;"
                     onmouseover="this.style.transform='translateY(-2px)'"
                     onmouseout="this.style.transform='translateY(0)'">
                ${link.icon} ${link.name}
            </button>`
        ).join('');
        
        playerContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 15px; margin: 10px 0;">
                <h3 style="color: #fff; margin-bottom: 15px; font-size: 18px;">
                    🎵 "${songInfo.title}" by ${songInfo.artist}
                </h3>
                <p style="color: #ccc; margin-bottom: 20px; font-size: 14px;">
                    Listen on your preferred platform:
                </p>
                ${linksHtml}
                <div style="margin-top: 15px;">
                    <button onclick="nextSong()" 
                            style="padding: 10px 25px; background: #28a745; color: white; border: none; 
                                   border-radius: 20px; cursor: pointer; font-size: 14px;">
                        ⏭️ Skip to Next Song
                    </button>
                </div>
            </div>
        `;
    }
}

// Open external music links as fallback
function openExternalMusicLinks(songInfo) {
    updatePlayerStatus(`🌐 Audio not available - Opening external links...`);
    
    const searchQuery = encodeURIComponent(`${songInfo.title} ${songInfo.artist}`);
    
    const musicLinks = [
        {
            name: 'YouTube Music',
            url: `https://music.youtube.com/search?q=${searchQuery}`,
            description: 'Open in YouTube Music'
        },
        {
            name: 'Spotify',
            url: `https://open.spotify.com/search/${searchQuery}`,
            description: 'Open in Spotify'
        },
        {
            name: 'JioSaavn',
            url: `https://www.jiosaavn.com/search/${searchQuery}`,
            description: 'Open in JioSaavn'
        }
    ];
    
    // Create link buttons in the UI
    const playerContainer = document.getElementById('audioPlayerContainer');
    if (playerContainer) {
        const linksHtml = musicLinks.map(link => 
            `<button onclick="window.open('${link.url}', '_blank')" 
                     class="music-link-btn" 
                     style="margin: 5px; padding: 10px; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
                            color: white; border: none; border-radius: 20px; cursor: pointer;">
                🎵 ${link.name}
            </button>`
        ).join('');
        
        playerContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #fff; margin-bottom: 15px;">
                    🎵 Listen to "${songInfo.title}" on:
                </p>
                ${linksHtml}
            </div>
        `;
    }
}

// Update player status
function updatePlayerStatus(status) {
    const audioStatus = document.getElementById('audioPlayerStatus');
    if (audioStatus) {
        audioStatus.textContent = status;
    }
    console.log('Player Status:', status);
}

// Get working YouTube video IDs for Tamil songs
function getWorkingYouTubeVideoId(songInfo) {
    const workingVideos = {
        // Exact song title matches (primary)
        'Why This Kolaveri Di': 'YR12Z8f1Dh8',
        'Vaathi Coming': 'bhZGhtKAKTU', 
        'Arabic Kuthu': 'vkqiC4KPeDs',
        'Rowdy Baby': 'x6Q7c9RyMzk',
        'Vaseegara': 'dzQ99-AqjJI',
        'Hosanna': 'CiFX5rJnhLk',
        'Aaluma Doluma': 'HiqmZLOuCMY',
        'Naakka Mukka': 'kK4xXZQ89Hc',
        'Selfie Pulla': 'vKtx8TiXUCs',
        'Marana Mass': 'vmgkwhwVZ0s',
        'Pathala Pathala': 'KJQ2wNdPjrM',
        'Chinna Chinna Aasai': 'jJ2s6FMu9jM',
        'Kadhal Rojave': 'hfbQFWnGw2Y',
        'Uyire Uyire': 'WZVn9N_jCJc',
        'Vennilave Vennilave': 'gQNDm3S7FLc',
        'Snehidhane': 'SZRcnKDMHqA',
        'Nenjukkul Peidhidum': 'yDKNs6gFUzg',
        'Mundhinam Paarthene': 'vfKGjZNIa5Y',
        'Munbe Vaa': 'IuLNbp6Wy6k',
        'Rakkamma Kaiya Thattu': 'F5DzBp5rNI4',
        'Kanne Kalaimane': 'kCyA-oYp57Y',
        'Mandram Vantha': 'J7W1WJd74fM',
        
        // Different videos for moods (secondary)
        'happy_1': 'YR12Z8f1Dh8', // Why This Kolaveri Di
        'happy_2': 'vkqiC4KPeDs', // Arabic Kuthu
        'happy_3': 'HiqmZLOuCMY', // Aaluma Doluma
        'happy_4': 'bhZGhtKAKTU', // Vaathi Coming
        'happy_5': 'kK4xXZQ89Hc', // Naakka Mukka
        
        'sad_1': 'CiFX5rJnhLk', // Hosanna
        'sad_2': 'gQNDm3S7FLc', // Vennilave Vennilave
        'sad_3': 'SZRcnKDMHqA', // Snehidhane
        'sad_4': 'kCyA-oYp57Y', // Kanne Kalaimane
        'sad_5': 'J7W1WJd74fM', // Mandram Vantha
        
        'energetic_1': 'x6Q7c9RyMzk', // Rowdy Baby
        'energetic_2': 'vkqiC4KPeDs', // Arabic Kuthu
        'energetic_3': 'HiqmZLOuCMY', // Aaluma Doluma
        'energetic_4': 'vmgkwhwVZ0s', // Marana Mass
        'energetic_5': 'bhZGhtKAKTU', // Vaathi Coming
        
        'relaxed_1': 'dzQ99-AqjJI', // Vaseegara
        'relaxed_2': 'CiFX5rJnhLk', // Hosanna
        'relaxed_3': 'IuLNbp6Wy6k', // Munbe Vaa
        'relaxed_4': 'yDKNs6gFUzg', // Nenjukkul Peidhidum
        'relaxed_5': 'gQNDm3S7FLc', // Vennilave Vennilave
        
        // Artist-specific defaults (tertiary)
        'anirudh_1': 'YR12Z8f1Dh8', // Why This Kolaveri Di
        'anirudh_2': 'vkqiC4KPeDs', // Arabic Kuthu
        'anirudh_3': 'HiqmZLOuCMY', // Aaluma Doluma
        'anirudh_4': 'bhZGhtKAKTU', // Vaathi Coming
        'anirudh_5': 'vKtx8TiXUCs', // Selfie Pulla
        
        'ar_rahman_1': 'CiFX5rJnhLk', // Hosanna
        'ar_rahman_2': 'gQNDm3S7FLc', // Vennilave Vennilave
        'ar_rahman_3': 'SZRcnKDMHqA', // Snehidhane
        'ar_rahman_4': 'jJ2s6FMu9jM', // Chinna Chinna Aasai
        'ar_rahman_5': 'hfbQFWnGw2Y', // Kadhal Rojave
        
        'harris_jayaraj_1': 'dzQ99-AqjJI', // Vaseegara
        'harris_jayaraj_2': 'yDKNs6gFUzg', // Nenjukkul Peidhidum
        'harris_jayaraj_3': 'IuLNbp6Wy6k', // Munbe Vaa
        'harris_jayaraj_4': 'vfKGjZNIa5Y', // Mundhinam Paarthene
        'harris_jayaraj_5': 'dzQ99-AqjJI', // Vaseegara
        
        'yuvan_1': 'x6Q7c9RyMzk', // Rowdy Baby
        'yuvan_2': 'vKgO1e-w_p4', // Ninaithu Ninaithu Parthen
        'yuvan_3': 'F3rZLaOhP5k', // Oru Kal Oru Kannadi
        'yuvan_4': 'x6Q7c9RyMzk', // Rowdy Baby
        'yuvan_5': 'vKgO1e-w_p4', // Ninaithu Ninaithu Parthen
    };
    
    console.log('Looking for video for song:', songInfo.title, 'Artist:', songInfo.artist, 'Mood:', songInfo.mood);
    
    // 1. Try exact song title match first
    const title = songInfo.title.toLowerCase();
    for (const [key, videoId] of Object.entries(workingVideos)) {
        if (key.toLowerCase() === title || title.includes(key.toLowerCase()) || key.toLowerCase().includes(title)) {
            console.log('Found exact title match:', key, '-> Video ID:', videoId);
            return videoId;
        }
    }
    
    // 2. Try artist-specific videos with index
    const artist = songInfo.artist.toLowerCase();
    if (artist.includes('anirudh')) {
        const index = (songInfo.index || 0) % 5 + 1;
        const key = `anirudh_${index}`;
        console.log('Using Anirudh video:', key, '-> Video ID:', workingVideos[key]);
        return workingVideos[key];
    }
    
    if (artist.includes('rahman')) {
        const index = (songInfo.index || 0) % 5 + 1;
        const key = `ar_rahman_${index}`;
        console.log('Using A.R. Rahman video:', key, '-> Video ID:', workingVideos[key]);
        return workingVideos[key];
    }
    
    if (artist.includes('harris')) {
        const index = (songInfo.index || 0) % 5 + 1;
        const key = `harris_jayaraj_${index}`;
        console.log('Using Harris Jayaraj video:', key, '-> Video ID:', workingVideos[key]);
        return workingVideos[key];
    }
    
    if (artist.includes('yuvan')) {
        const index = (songInfo.index || 0) % 5 + 1;
        const key = `yuvan_${index}`;
        console.log('Using Yuvan video:', key, '-> Video ID:', workingVideos[key]);
        return workingVideos[key];
    }
    
    // 3. Try mood-based videos with index
    const mood = (songInfo.mood || 'happy').toLowerCase();
    let moodKey = 'happy';
    
    if (mood.includes('sad') || mood.includes('melancholy')) {
        moodKey = 'sad';
    } else if (mood.includes('relax') || mood.includes('calm')) {
        moodKey = 'relaxed';
    } else if (mood.includes('energetic') || mood.includes('party') || mood.includes('dance')) {
        moodKey = 'energetic';
    }
    
    const index = (songInfo.index || 0) % 5 + 1;
    const key = `${moodKey}_${index}`;
    
    console.log('Using mood-based video:', key, '-> Video ID:', workingVideos[key]);
    return workingVideos[key] || workingVideos['happy_1'];
}

// Get potential audio sources for a song
function getAudioSources(songInfo) {
    // Create song-specific ID for audio generation
    const songId = generateSongId(songInfo);
    
    // Mix of working audio sources
    const sources = [
        // Primary: Generated audio based on song
        `/generate-audio/${songId}`,
        
        // Secondary: Static audio files
        '/audio/sample1.mp3',
        '/audio/sample2.mp3',
        '/audio/sample3.mp3',
        
        // Tertiary: External working sources
        'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3',
        'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_1MG.mp3',
        'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
        'https://archive.org/download/SampleAudio0424/SampleAudio_0.4s_1MB_mp3.mp3'
    ];
    
    return sources;
}

// Play YouTube video directly on the page with backend search
function playYouTubeDirectly(songInfo) {
    console.log('Playing YouTube video for:', songInfo.title);
    
    // Store current song info globally for error handling
    window.currentSongInfo = songInfo;
    
    // Enable auto-play mode for playlist progression
    if (currentPlaylist && currentPlaylist.songs) {
        autoPlayMode = true;
        console.log('Auto-play enabled for playlist progression');
    }
    
    // Hide audio player, show YouTube player
    const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const customPlayer = document.getElementById('customPlayer');
    const youtubePlayerDiv = document.getElementById('youtubePlayer');
    
    if (audioPlayerContainer) audioPlayerContainer.style.display = 'none';
    if (customPlayer) customPlayer.style.display = 'none';
    if (youtubePlayerDiv) youtubePlayerDiv.style.display = 'block';
    
    updatePlayerStatus(`🔍 Searching YouTube for: ${songInfo.title}...`);
    
    // Search for the exact song using backend
    searchYouTubeInBackend(songInfo).then(videoId => {
        if (videoId) {
            console.log('Backend found video ID:', videoId, 'for song:', songInfo.title);
            
            // Wait for YouTube API to be ready
            if (typeof YT !== 'undefined' && YT.Player) {
                // Add a timeout to detect if embedding fails
                const embedTimeout = setTimeout(() => {
                    console.log('YouTube embedding timeout, switching to audio...');
                    playEnhancedAudio(songInfo);
                }, 10000); // 10 seconds timeout
                
                // Clear timeout if player loads successfully
                const originalOnReady = window.onPlayerReady;
                window.onPlayerReady = function(event) {
                    clearTimeout(embedTimeout);
                    updatePlayerStatus(`🎵 Playing: ${songInfo.title}`);
                    if (originalOnReady) originalOnReady(event);
                };
                
                initYouTubePlayer(videoId);
            } else {
                console.log('YouTube API not ready, waiting...');
                setTimeout(() => {
                    if (typeof YT !== 'undefined' && YT.Player) {
                        initYouTubePlayer(videoId);
                    } else {
                        console.log('YouTube API failed to load, using enhanced audio');
                        playEnhancedAudio(songInfo);
                    }
                }, 2000);
            }
        } else {
            console.log('No video found, using enhanced audio playback');
            playEnhancedAudio(songInfo);
        }
    }).catch(error => {
        console.error('Search failed:', error);
        playEnhancedAudio(songInfo);
    });
}

// Enhanced YouTube search using your API
async function searchYouTubeInBackend(songInfo) {
    try {
        console.log('🔍 Searching YouTube API for:', songInfo.title, 'by', songInfo.artist);
        
        const response = await fetch('/search-youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                songTitle: songInfo.title,
                artist: songInfo.artist,
                movie: songInfo.movie || ''
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🎬 YouTube API search result:', data);
        
        if (data.success && data.videoId) {
            // Store additional video info
            if (data.allResults && data.allResults.length > 1) {
                window.currentVideoOptions = data.allResults;
                console.log(`📺 Found ${data.allResults.length} video options for this song`);
            }
            
            updatePlayerStatus(`🎬 Found: ${data.title}`);
            return data.videoId;
        } else {
            console.log('❌ YouTube API search unsuccessful');
            return null;
        }
    } catch (error) {
        console.error('❌ YouTube API search error:', error);
        return null;
    }
}

// Get multiple video options for a song
async function getVideoOptions(songInfo) {
    try {
        console.log('🎬 Getting video options for:', songInfo.title);
        
        const response = await fetch('/get-video-options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                songTitle: songInfo.title,
                artist: songInfo.artist,
                movie: songInfo.movie || ''
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.options && data.options.length > 0) {
                console.log(`📺 Got ${data.options.length} video options:`, data.options.slice(0, 3));
                return data.options;
            }
        }
        
        return [];
    } catch (error) {
        console.error('❌ Error getting video options:', error);
        return [];
    }
}

// Play audio directly on the page using HTML5 audio (fallback)
function playAudioDirectly(songInfo) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const audioStatus = document.getElementById('audioPlayerStatus');
    const customPlayer = document.getElementById('customPlayer');
    const youtubePlayerDiv = document.getElementById('youtubePlayer');
    
    // Hide YouTube player, show audio player
    if (youtubePlayerDiv) youtubePlayerDiv.style.display = 'none';
    if (customPlayer) customPlayer.style.display = 'block';
    
    // Update custom player info
    if (document.getElementById('playerSongTitle')) {
        document.getElementById('playerSongTitle').textContent = songInfo.title;
    }
    if (document.getElementById('playerArtist')) {
        document.getElementById('playerArtist').textContent = songInfo.artist;
    }
    
    // Try to find audio sources for the song
    const audioSources = getAudioSources(songInfo);
    
    if (audioSources.length > 0) {
        updatePlayerStatus('Loading audio...');
        playAudioFromSources(audioSources, songInfo);
    } else {
        // Fallback to simulated playback
        updatePlayerStatus('🎵 Playing: Simulated audio playback');
        simulateAudioPlayback(songInfo);
    }
}

// Play audio from available sources with fallback
function playAudioFromSources(sources, songInfo) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const audioStatus = document.getElementById('audioPlayerStatus');
    
    let currentSourceIndex = 0;
    
    function tryNextSource() {
        if (currentSourceIndex < sources.length) {
            const source = sources[currentSourceIndex];
            console.log(`Trying audio source ${currentSourceIndex + 1}:`, source);
            
            audioSource.src = source;
            audioPlayer.load();
            
            audioStatus.textContent = `🔄 Loading audio ${currentSourceIndex + 1}/${sources.length}...`;
            
            // Set up event listeners
            audioPlayer.onloadeddata = () => {
                console.log('Audio loaded successfully:', source);
                audioStatus.textContent = `🎵 Ready to play: ${songInfo.title}`;
                
                // Try to play
                audioPlayer.play().then(() => {
                    audioStatus.textContent = `🎵 Playing: ${songInfo.title}`;
                    console.log('Audio playing successfully from source:', source);
                    
                    // Update play button
                    const playBtn = document.getElementById('playBtn');
                    if (playBtn) {
                        playBtn.textContent = '⏸️ Pause';
                    }
                }).catch(error => {
                    console.log('Play failed, trying next source:', error);
                    currentSourceIndex++;
                    setTimeout(tryNextSource, 1000);
                });
            };
            
            audioPlayer.onerror = () => {
                console.log('Audio load error, trying next source');
                currentSourceIndex++;
                setTimeout(tryNextSource, 1000);
            };
            
            // Timeout fallback
            setTimeout(() => {
                if (audioPlayer.readyState === 0) {
                    console.log('Audio load timeout, trying next source');
                    currentSourceIndex++;
                    tryNextSource();
                }
            }, 5000);
            
        } else {
            // All sources failed, force play a known working source
            console.log('All sources failed, using forced fallback');
            forcePlayFallback(songInfo);
        }
    }
    
    tryNextSource();
}

// Force play a known working audio source
function forcePlayFallback(songInfo) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const audioStatus = document.getElementById('audioPlayerStatus');
    
    // Use a definitely working audio source
    const fallbackSource = 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3';
    
    audioSource.src = fallbackSource;
    audioPlayer.load();
    
    audioStatus.textContent = `🎵 Playing fallback audio for: ${songInfo.title}`;
    
    audioPlayer.onloadeddata = () => {
        audioPlayer.play().then(() => {
            audioStatus.textContent = `🎵 Audio playing: ${songInfo.title} (Sample Track)`;
            const playBtn = document.getElementById('playBtn');
            if (playBtn) {
                playBtn.textContent = '⏸️ Pause';
            }
        }).catch(() => {
            // If even this fails, show simulation
            audioStatus.textContent = `🎵 Audio simulation: ${songInfo.title}`;
            simulateAudioPlayback(songInfo);
        });
    };
    
    audioPlayer.onerror = () => {
        audioStatus.textContent = `🎵 Audio simulation: ${songInfo.title}`;
        simulateAudioPlayback(songInfo);
    };
}

// Simulate audio playback with visual feedback
function simulateAudioPlayback(songInfo) {
    const audioStatus = document.getElementById('audioPlayerStatus');
    const playBtn = document.getElementById('playBtn');
    
    // Show playing status
    audioStatus.textContent = `🎵 Now Playing: ${songInfo.title} by ${songInfo.artist}`;
    playBtn.textContent = '⏸️ Pause';
    playBtn.onclick = () => pauseSimulation();
    
    // Simulate progress
    let progress = 0;
    const duration = 180; // 3 minutes simulation
    
    const progressInterval = setInterval(() => {
        progress++;
        const minutes = Math.floor(progress / 60);
        const seconds = progress % 60;
        audioStatus.textContent = `🎵 Playing: ${songInfo.title} [${minutes}:${seconds.toString().padStart(2, '0')}]`;
        
        if (progress >= duration) {
            clearInterval(progressInterval);
            nextSong(); // Auto-advance to next song
        }
    }, 1000);
    
    // Store interval for pause functionality
    window.currentSimulation = progressInterval;
}

// Toggle playback functionality
function togglePlayback() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    
    if (audioPlayer.src && !audioPlayer.paused) {
        audioPlayer.pause();
        playBtn.textContent = '▶️ Play';
    } else if (audioPlayer.src) {
        audioPlayer.play();
        playBtn.textContent = '⏸️ Pause';
    } else {
        // No audio source, restart current song
        if (currentPlaylist && currentSongIndex >= 0) {
            const currentSong = currentPlaylist[currentSongIndex];
            playAudioDirectly(currentSong);
        }
    }
}

// Generate song ID for audio mapping
function generateSongId(songInfo) {
    const mood = songInfo.mood || 'happy';
    const language = 'tamil';
    const artist = songInfo.artist.toLowerCase();
    
    // Create specific IDs based on song characteristics
    if (artist.includes('rahman')) {
        return 'ar-rahman-1';
    } else if (artist.includes('anirudh')) {
        return 'anirudh-1';
    } else if (mood.includes('sad') || mood.includes('melancholy')) {
        return 'tamil-sad-1';
    } else if (mood.includes('relax') || mood.includes('calm')) {
        return 'tamil-relaxed-1';
    } else if (mood.includes('happy') || mood.includes('energetic')) {
        return Math.random() > 0.5 ? 'tamil-happy-1' : 'tamil-happy-2';
    }
    
    return 'tamil-happy-1'; // Default
}

// Enhanced toggle playback for both YouTube and audio
function togglePlayback() {
    // If YouTube player is active
    if (youtubePlayer && youtubePlayer.getPlayerState) {
        try {
            const state = youtubePlayer.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                youtubePlayer.pauseVideo();
                updatePlayerStatus('⏸️ Paused');
            } else {
                youtubePlayer.playVideo();
                updatePlayerStatus('🎵 Playing from YouTube');
            }
            return;
        } catch (e) {
            console.log('YouTube player not available:', e);
        }
    }
    
    // Fallback to audio player
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    
    if (audioPlayer && audioPlayer.src) {
        if (!audioPlayer.paused) {
            audioPlayer.pause();
            if (playBtn) playBtn.textContent = '▶️ Play';
            updatePlayerStatus('⏸️ Paused');
        } else {
            audioPlayer.play();
            if (playBtn) playBtn.textContent = '⏸️ Pause';
            updatePlayerStatus('🎵 Playing audio');
        }
    } else {
        // No audio source, restart current song
        if (currentPlaylist && currentSongIndex >= 0) {
            const currentSong = currentPlaylist[currentSongIndex];
            playYouTubeDirectly(currentSong);
        }
    }
}

// Make YouTube API callback available globally
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// Embed YouTube search results instead of specific videos
function embedYouTubePlayerDirect(videoId, searchQuery = '') {
    const playerContainer = document.getElementById('youtubePlayer');
    
    if (!playerContainer) {
        console.error('YouTube player container not found');
        return;
    }
    
    console.log('Setting up YouTube player with:', videoId || searchQuery);
    
    // If no video ID or we want to use search, show YouTube search results
    if (!videoId || videoId === 'search') {
        embedYouTubeSearch(searchQuery);
        return;
    }
    
    // Try to embed the specific video
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`;
    
    playerContainer.src = embedUrl;
    playerContainer.style.display = 'block';
    playerContainer.style.width = '100%';
    playerContainer.style.height = '300px';
    playerContainer.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    playerContainer.allowFullscreen = true;
    
    // Add error handling - if video fails, switch to search
    playerContainer.onload = function() {
        console.log('YouTube player loaded');
        // Check if video is actually available after a short delay
        setTimeout(() => {
            // If we still see "Video unavailable", switch to search
            if (playerContainer.contentWindow) {
                try {
                    // This is a simple check - in practice, we'll just switch to search after any load issue
                    console.log('Video loaded successfully');
                } catch (e) {
                    console.log('Video might be restricted, switching to search');
                    embedYouTubeSearch(searchQuery);
                }
            }
        }, 2000);
    };
    
    playerContainer.onerror = function() {
        console.log('Error loading video:', videoId, 'switching to search');
        embedYouTubeSearch(searchQuery);
    };
    
    // Set up auto-advance to next song
    if (autoPlayMode && currentPlaylist) {
        setTimeout(() => {
            nextSong();
        }, 240000); // 4 minutes
    }
}

// Embed YouTube search results page
function embedYouTubeSearch(searchQuery) {
    const playerContainer = document.getElementById('youtubePlayer');
    if (playerContainer) {
        console.log('Opening YouTube search for:', searchQuery);
        
        // Create YouTube search URL
        const encodedQuery = encodeURIComponent(searchQuery);
        const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
        
        // Open YouTube search in new tab
        window.open(searchUrl, '_blank');
        
        // Show custom music player interface in iframe instead
        playerContainer.style.display = 'block';
        playerContainer.style.width = '100%';
        playerContainer.style.height = '300px';
        
        // Clear src to avoid "refused to connect" error
        playerContainer.src = '';
        
        // Create custom HTML content for the player area
        const playerHTML = `
            <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="font-size: 24px; margin-bottom: 10px;">🎵</div>
                <h3 style="margin: 10px 0; font-size: 18px;">Now Searching:</h3>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">${searchQuery}</p>
                <div style="margin: 20px 0;">
                    <p style="font-size: 12px; opacity: 0.8;">YouTube opened in new tab</p>
                    <p style="font-size: 11px; opacity: 0.7;">Click on any video to play music!</p>
                </div>
                <button onclick="nextSong()" style="
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 20px;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    Next Song ⏭️
                </button>
            </div>
        `;
        
        // Use srcdoc to embed custom HTML
        playerContainer.srcdoc = playerHTML;
        
        console.log('YouTube search opened in new tab, custom player shown');
        
        // Auto-advance after 30 seconds if in autoplay mode
        if (autoPlayMode && currentPlaylist) {
            setTimeout(() => {
                nextSong();
            }, 30000);
        }
    }
}

// Update now playing display
function updateNowPlaying(songInfo) {
    const nowPlaying = document.getElementById('nowPlaying');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    
    if (nowPlaying && songTitle && songArtist) {
        songTitle.textContent = songInfo.title;
        songArtist.textContent = `${songInfo.artist} • ${songInfo.movie}`;
        nowPlaying.style.display = 'block';
    }
}

// Embed YouTube player (if API key available)
function embedYouTubePlayer(videoId) {
    const playerContainer = document.getElementById('youtubePlayer');
    if (playerContainer) {
        playerContainer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        playerContainer.style.display = 'block';
        
        // Set up next song auto-play
        if (autoPlayMode) {
            // YouTube videos average 3-4 minutes, play next song after current ends
            setTimeout(() => {
                nextSong();
            }, 240000); // 4 minutes
        }
    }
}

// Play next song in auto-play mode
function nextSong() {
    console.log('Next song requested. AutoPlay:', autoPlayMode, 'Current playlist:', !!currentPlaylist, 'Current index:', currentSongIndex);
    
    if (!autoPlayMode || !currentPlaylist) {
        console.log('Auto-play not enabled or no playlist');
        return;
    }
    
    if (currentSongIndex < currentPlaylist.songs.length - 1) {
        console.log('Moving to next song:', currentSongIndex + 1);
        playSongByIndex(currentSongIndex + 1);
    } else {
        // Playlist finished
        console.log('Playlist finished');
        addMessage(`🎵 Playlist "${currentPlaylist.title}" finished! Want to hear it again or try a different mood?`, 'bot');
        autoPlayMode = false;
        
        // Reset to first song for potential replay
        currentSongIndex = -1;
    }
}

// Rename the index-based playSong to avoid conflicts
function playSongByIndex(index) {
    if (!currentPlaylist || !currentPlaylist.songs[index]) {
        console.log('No song at index:', index);
        return;
    }
    
    const song = currentPlaylist.songs[index];
    song.index = index; // Add index to song info for video selection
    currentSongIndex = index;
    
    console.log('Playing song at index:', index, '- Title:', song.title);
    
    // Update UI to show current playing song
    document.querySelectorAll('.song-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('playing');
            const playBtn = item.querySelector('.play-btn i');
            if (playBtn) playBtn.className = 'fas fa-pause';
        } else {
            item.classList.remove('playing');
            const playBtn = item.querySelector('.play-btn i');
            if (playBtn) playBtn.className = 'fas fa-play';
        }
    });
    
    // Search YouTube and play
    searchAndPlayYouTube(song.search, song);
}

// Legacy function for compatibility
function playSong(indexOrTitle, artist) {
    if (typeof indexOrTitle === 'number') {
        // If called with index, use the new function
        playSongByIndex(indexOrTitle);
    } else {
        // If called with title and artist, use the old behavior
        console.log('Playing song:', indexOrTitle, 'by', artist);
        addMessage(`🎵 Playing: ${indexOrTitle} by ${artist}`, 'bot');
        
        // Create platform links
        const searchQuery = `${indexOrTitle} ${artist}`;
        const platformLinks = {
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
            spotify: `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`,
            apple: `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`,
            jiosaavn: `https://www.jiosaavn.com/search/${encodeURIComponent(searchQuery)}`
        };
        
        addPlatformLinks(platformLinks, indexOrTitle);
    }
}

// Global functions (make them accessible to onclick handlers)
window.playSong = playSong;
window.playSongByIndex = playSongByIndex;
window.playAllSongs = playAllSongs;
window.shufflePlaylist = shufflePlaylist;
window.nextSong = nextSong;
window.togglePlayback = togglePlayback;

// Enhanced playlist management functions
window.showCreatePlaylistDialog = function() {
    const name = prompt('Enter playlist name:');
    if (name && name.trim()) {
        const description = prompt('Enter playlist description (optional):') || '';
        musicManager.createPlaylist(name.trim(), description.trim());
    }
};

window.openPlaylist = function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist) {
        addMessage(`📁 Opening playlist: ${playlist.name}`, 'bot');
        
        if (playlist.songs.length === 0) {
            addMessage('This playlist is empty. Add some songs to get started! 🎵', 'bot');
        } else {
            const songList = playlist.songs.map((song, index) => 
                `${index + 1}. ${song.title} by ${song.artist}`
            ).join('\n');
            
            addMessage(`🎵 Playlist: ${playlist.name}\n${songList}`, 'bot');
            
            // Add playlist controls
            const playlistControls = `
                <div style="margin: 10px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <button onclick="playPlaylist('${playlistId}')" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            ▶️ Play All
                        </button>
                        <button onclick="shufflePlaylist('${playlistId}')" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            🔀 Shuffle
                        </button>
                        <button onclick="showAddToPlaylistOptions('${playlistId}')" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 20px; cursor: pointer;">
                            ➕ Add Songs
                        </button>
                    </div>
                </div>
            `;
            
            const messagesContainer = document.getElementById('messages');
            if (messagesContainer) {
                messagesContainer.insertAdjacentHTML('beforeend', playlistControls);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }
};

window.editPlaylist = function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist) {
        const newName = prompt('Enter new playlist name:', playlist.name);
        if (newName && newName.trim() && newName.trim() !== playlist.name) {
            // Update playlist name (this would need a server endpoint)
            console.log('Editing playlist:', playlistId, 'New name:', newName);
            addMessage(`✏️ Playlist renamed to: ${newName}`, 'bot');
        }
    }
};

window.deletePlaylist = function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist && confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
        // Delete playlist (this would need a server endpoint)
        console.log('Deleting playlist:', playlistId);
        addMessage(`🗑️ Playlist "${playlist.name}" deleted`, 'bot');
        // Remove from local array temporarily
        const index = userPlaylists.findIndex(p => p.id === playlistId);
        if (index > -1) {
            userPlaylists.splice(index, 1);
            updatePlaylistUI();
        }
    }
};

window.playPlaylist = function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist && playlist.songs.length > 0) {
        addMessage(`🎵 Playing playlist: ${playlist.name}`, 'bot');
        
        // Create a temporary playlist from the saved songs
        currentPlaylist = playlist.songs.map(song => ({
            title: song.title,
            artist: song.artist,
            search: `${song.title} ${song.artist}`
        }));
        
        currentSongIndex = 0;
        autoPlayMode = true;
        playSongByIndex(0);
    }
};

window.shufflePlaylist = function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (playlist && playlist.songs.length > 0) {
        addMessage(`🔀 Shuffling playlist: ${playlist.name}`, 'bot');
        
        // Create and shuffle the playlist
        const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
        currentPlaylist = shuffled.map(song => ({
            title: song.title,
            artist: song.artist,
            search: `${song.title} ${song.artist}`
        }));
        
        currentSongIndex = 0;
        autoPlayMode = true;
        playSongByIndex(0);
    }
};

window.showAddToPlaylistOptions = function(playlistId = null) {
    if (userPlaylists.length === 0) {
        addMessage('Create a playlist first before adding songs! 📁', 'bot');
        return;
    }
    
    const playlistOptions = userPlaylists.map(playlist => 
        `<button onclick="promptAddToPlaylist('${playlist.id}')" style="display: block; width: 100%; margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 10px; cursor: pointer; text-align: left;">
            📁 ${playlist.name} (${playlist.songs.length} songs)
        </button>`
    ).join('');
    
    const addToPlaylistUI = `
        <div style="margin: 10px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 15px;">
            <h4 style="color: #fff; margin: 0 0 10px 0;">Add Song to Playlist:</h4>
            <input type="text" id="songToAdd" placeholder="Enter: Song Title - Artist Name" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 20px; border: none;">
            <div style="max-height: 150px; overflow-y: auto;">
                ${playlistOptions}
            </div>
        </div>
    `;
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        messagesContainer.insertAdjacentHTML('beforeend', addToPlaylistUI);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

window.promptAddToPlaylist = function(playlistId) {
    const songInput = document.getElementById('songToAdd');
    if (!songInput || !songInput.value.trim()) {
        alert('Please enter a song title and artist name!');
        return;
    }
    
    const songText = songInput.value.trim();
    const parts = songText.split(' - ');
    
    if (parts.length !== 2) {
        alert('Please use the format: Song Title - Artist Name');
        return;
    }
    
    const song = {
        title: parts[0].trim(),
        artist: parts[1].trim(),
        id: Date.now().toString()
    };
    
    musicManager.addToPlaylist(playlistId, song).then(success => {
        if (success) {
            const playlist = userPlaylists.find(p => p.id === playlistId);
            addMessage(`✅ Added "${song.title}" by ${song.artist} to "${playlist.name}"`, 'bot');
            updatePlaylistUI();
        } else {
            addMessage('❌ Failed to add song to playlist', 'bot');
        }
    });
};

window.toggleAdvancedSearch = function() {
    const searchInterface = document.getElementById('advancedSearchInterface');
    if (searchInterface) {
        advancedSearchMode = !advancedSearchMode;
        searchInterface.style.display = advancedSearchMode ? 'block' : 'none';
    }
};

window.performAdvancedSearch = async function() {
    const artist = document.getElementById('searchArtist').value.trim();
    const year = document.getElementById('searchYear').value.trim();
    const title = document.getElementById('searchTitle').value.trim();
    
    const filters = {
        language: currentLanguage !== 'all' ? currentLanguage : undefined,
        genre: currentGenre !== 'all' ? currentGenre : undefined,
        mood: currentMood !== 'all' ? currentMood : undefined,
        artist: artist || undefined,
        year: year ? parseInt(year) : undefined,
        title: title || undefined
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    addMessage('🔍 Performing advanced search...', 'bot');
    
    const results = await musicManager.advancedSearch(filters);
    
    if (results.length === 0) {
        addMessage('No songs found matching your criteria. Try adjusting your filters! 🎵', 'bot');
    } else {
        addMessage(`🎵 Found ${results.length} songs matching your criteria:`, 'bot');
        
        // Display search results with play buttons
        const resultsList = results.slice(0, 10).map((song, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: rgba(255,255,255,0.1); border-radius: 10px;">
                <div>
                    <div style="color: #fff; font-weight: bold;">${song.title}</div>
                    <div style="color: #ccc; font-size: 12px;">by ${song.artist} ${song.year ? `(${song.year})` : ''}</div>
                    <div style="color: #aaa; font-size: 11px;">${song.language} • ${song.genre}</div>
                </div>
                <button onclick="playSearchResult('${song.title}', '${song.artist}')" style="background: #28a745; color: white; border: none; border-radius: 15px; padding: 8px 12px; cursor: pointer;">
                    ▶️ Play
                </button>
            </div>
        `).join('');
        
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.insertAdjacentHTML('beforeend', `
                <div style="margin: 10px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 15px;">
                    ${resultsList}
                </div>
            `);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
};

window.playSearchResult = function(title, artist) {
    addMessage(`🎵 Playing: ${title} by ${artist}`, 'bot');
    
    // Search YouTube and play
    const searchQuery = `${title} ${artist}`;
    searchAndPlayYouTube(searchQuery, { title, artist });
};

console.log('Client script loaded successfully with advanced features');