const socket = io();

let selectedMood = null;
let selectedLanguage = null;

// Initialize Unified Music Player
let musicPlayer = null;

// Initialize Spotify-Style Playlist UI
let playlistUI = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Create unified music player
    if (typeof UnifiedMusicPlayer !== 'undefined') {
        musicPlayer = new UnifiedMusicPlayer();
        window.musicPlayer = musicPlayer; // Make it globally accessible
        console.log('Unified Music Player initialized');
        
        // Set up event handlers
        musicPlayer.onSongChange = (song) => {
            console.log('Now playing:', song.title);
            updateNowPlayingUI(song);
        };
        
        musicPlayer.onPlayStateChange = (isPlaying) => {
            console.log('Play state:', isPlaying);
        };
    } else {
        console.error('UnifiedMusicPlayer not loaded!');
    }
    
    // Create Spotify-Style Playlist UI
    if (typeof PlaylistUI !== 'undefined') {
        playlistUI = new PlaylistUI('#playlistUIContainer');
        console.log('Playlist UI initialized');
        
        // Load available playlists and show song counts on buttons
        loadPlaylistCounts();
    } else {
        console.error('PlaylistUI not loaded!');
    }
    
    initializeEventListeners();
});

// Add welcome message
function addWelcomeMessage() {
    addMessage('🎵 Welcome to MoodTunes! Your intelligent music companion is ready to help you discover amazing music!', 'bot');
    addMessage('💡 Try: "show songs" or "play Vaseegara" or "mood playlist happy"', 'bot');
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

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('Search input found, adding listener');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    handleSearch(query);
                    searchInput.value = '';
                }
            }
        });
    } else {
        console.error('Search input not found!');
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
window.handleChatSubmit = async function(e) {
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
        input.value = '';
        
        // Handle local playlist commands first
        const lowerMessage = message.toLowerCase();

        // Simple mode prefix: if user starts with 'simple:' route to lightweight endpoint
        if (lowerMessage.startsWith('simple:')) {
            const plain = message.replace(/^simple:/i, '').trim();
            callSimpleChat(plain);
            return;
        }
        
        // MOOD-BASED MUSIC SYSTEM - Analyze emotion and play real songs
        if (window.moodAnalyzer && window.realMusicPlayer) {
            // Analyze the user's mood from their message
            const analysis = window.moodAnalyzer.analyzeMessage(message);
            
            // Show empathetic response
            addMessage(analysis.response, 'bot');
            
            // Show mood report if confidence is high
            if (analysis.confidence > 0.5) {
                setTimeout(() => {
                    window.moodAnalyzer.displayMoodReport(analysis.moodReport);
                }, 500);
                
                // Show song recommendations
                if (analysis.songRecommendations.length > 0) {
                    setTimeout(() => {
                        displaySongRecommendations(analysis.songRecommendations, analysis.mood);
                    }, 1000);
                }
                
                return; // Stop here, don't send to server
            }
        }
        
        // Direct play commands
        if (lowerMessage.startsWith('play ') && !lowerMessage.includes('playlist')) {
            handleDirectSongPlay(message);
            return;
        }
        
        if (lowerMessage === 'show songs' || lowerMessage === 'all songs' || lowerMessage === 'song list') {
            displayAllSongs();
            return;
        }
        
        if (lowerMessage.startsWith('search ')) {
            const query = message.substring(7);
            searchAndDisplaySongs(query);
            return;
        }
        
        // Playlist commands
        if (lowerMessage.includes('random playlist') || lowerMessage.includes('create random playlist')) {
            handleCreateRandomPlaylist(message);
            return;
        }
        
        if (lowerMessage.includes('mood playlist') || lowerMessage.includes('playlist by mood')) {
            handleCreateMoodPlaylist(message);
            return;
        }
        
        if (lowerMessage.includes('artist playlist') || lowerMessage.includes('playlist by artist')) {
            handleCreateArtistPlaylist(message);
            return;
        }
        
        if (lowerMessage.includes('smart playlist') || lowerMessage.includes('create smart playlist')) {
            handleCreateSmartPlaylist();
            return;
        }
        
        if (lowerMessage.includes('play playlist') || lowerMessage.includes('start playlist')) {
            handlePlayPlaylist();
            return;
        }
        
        if (lowerMessage.includes('next song') || lowerMessage === 'next') {
            handleNextSong();
            return;
        }
        
        if (lowerMessage.includes('previous song') || lowerMessage === 'previous' || lowerMessage === 'prev') {
            handlePreviousSong();
            return;
        }
        
        if (lowerMessage.includes('shuffle') && lowerMessage.includes('playlist')) {
            handleToggleShuffle();
            return;
        }
        
        if (lowerMessage.includes('repeat') && lowerMessage.includes('playlist')) {
            handleToggleRepeat();
            return;
        }
        
        if (lowerMessage.includes('show playlist') || lowerMessage.includes('current playlist')) {
            handleShowCurrentPlaylist();
            return;
        }
        
        // Send message via Socket.IO (original working method)
        console.log('Sending message via Socket.IO:', { 
            text: message,
            mood: selectedMood,
            language: selectedLanguage 
        });
        
        socket.emit('chat', {
            text: message,
            mood: selectedMood,
            language: selectedLanguage
        });
        
        console.log('Message sent to server');
    }
}

// Call simple chat endpoint
async function callSimpleChat(text) {
    try {
        addMessage('🟢 (Simple Mode) Processing...', 'bot');
        const resp = await fetch('/api/simple-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await resp.json();
        if (!data.success) {
            addMessage('❌ Simple mode error: ' + (data.error || 'Unknown'), 'bot');
            return;
        }
        addMessage(data.text, 'bot');
        if (data.musicControl && window.musicPlayer) {
            // Play songs if available
            if (Array.isArray(data.musicControl.songs) && data.musicControl.songs.length > 0) {
                window.musicPlayer.playPlaylist(data.musicControl.songs, 0);
            }
        }
        if (data.offlineFallback) {
            showOfflineBanner(data.reason);
        } else {
            removeOfflineBanner();
        }
    } catch (e) {
        addMessage('❌ Simple mode failed: ' + e.message, 'bot');
    }
}

function showOfflineBanner(reason) {
    let banner = document.getElementById('offlineBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offlineBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:8px 14px;background:#ff9800;color:#222;font-weight:600;font-family:system-ui;z-index:9999;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.25)';
        document.body.appendChild(banner);
    }
    const reasonMap = {
        no_key: 'OpenAI key missing – using local fallback',
        quota_429: 'OpenAI quota exceeded – temporary local mode',
        cooldown: 'Cooling down after quota error – retry later',
        error: 'OpenAI error – fallback mode active'
    };
    banner.textContent = `⚠ AI Fallback Active: ${reasonMap[reason] || 'offline'}`;
}

function removeOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) banner.remove();
}

// Handle search functionality
function handleSearch(query) {
    console.log('Search query:', query);
    
    // Add search message to chat
    addMessage(`🔍 Searching for: "${query}"`, 'user');
    
    // Send search request to server
    socket.emit('youtube search', {
        query: query,
        language: selectedLanguage || 'tamil'
    });
}

// Handle chat response from Netlify function
function handleChatResponse(data) {
    console.log('Received chat response:', data);
    
    if (data.analysis && data.analysis.response) {
        addMessage(data.analysis.response, 'bot');
    }
    
    if (data.playlist) {
        displayPlaylist(data.playlist);
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

// Load playlist counts and add badges to buttons
async function loadPlaylistCounts() {
    try {
        const response = await fetch('/api/playlists');
        const data = await response.json();
        
        if (data.success && data.playlists) {
            // Create a map of mood+language -> count
            const countMap = {};
            data.playlists.forEach(playlist => {
                const key = `${playlist.mood}-${playlist.language}`;
                countMap[key] = playlist.count;
            });
            
            // Add count badges to mood buttons (show total across all languages)
            const moodCounts = {};
            data.playlists.forEach(playlist => {
                if (!moodCounts[playlist.mood]) {
                    moodCounts[playlist.mood] = 0;
                }
                moodCounts[playlist.mood] += playlist.count;
            });
            
            Object.entries(moodCounts).forEach(([mood, count]) => {
                const btn = document.querySelector(`[data-mood="${mood}"]`);
                if (btn && count > 0) {
                    // Add count badge if it doesn't exist
                    if (!btn.querySelector('.count-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'count-badge';
                        badge.textContent = count;
                        badge.style.cssText = `
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border-radius: 12px;
                            padding: 2px 8px;
                            font-size: 0.7rem;
                            font-weight: 700;
                        `;
                        btn.style.position = 'relative';
                        btn.appendChild(badge);
                    }
                }
            });
            
            // Add count badges to language buttons (show total across all moods)
            const langCounts = {};
            data.playlists.forEach(playlist => {
                if (!langCounts[playlist.language]) {
                    langCounts[playlist.language] = 0;
                }
                langCounts[playlist.language] += playlist.count;
            });
            
            Object.entries(langCounts).forEach(([language, count]) => {
                const btn = document.querySelector(`[data-language="${language}"]`);
                if (btn && count > 0) {
                    // Add count badge if it doesn't exist
                    if (!btn.querySelector('.count-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'count-badge';
                        badge.textContent = count;
                        badge.style.cssText = `
                            float: right;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border-radius: 12px;
                            padding: 2px 8px;
                            font-size: 0.75rem;
                            font-weight: 700;
                        `;
                        btn.appendChild(badge);
                    }
                }
            });
            
            console.log('Playlist counts loaded:', data.totalPlaylists, 'playlists');
        }
    } catch (error) {
        console.error('Error loading playlist counts:', error);
    }
}

// Request playlists
async function requestPlaylists(mood, language) {
    console.log('Requesting playlists for:', mood, language);
    
    // Show loading message
    addMessage(`Finding ${mood} ${language} songs...`, 'bot');
    
    // Fetch and display Spotify-style playlist
    if (playlistUI) {
        await playlistUI.displayPlaylist(mood, language);
    }
    
    // Also send to chat for AI response
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

// Play individual song - Updated to use Local Music System
function playSong(title, artist) {
    console.log('🎵 Playing song locally:', title, 'by', artist);
    addMessage(`🎵 Loading: ${title} by ${artist}...`, 'bot');
    
    // Store song info for player
    window.currentSongInfo = { title, artist };
    
    // Search local database first
    const localResults = window.localMusicPlayer.searchLocalSongs(title);
    
    if (localResults.length > 0) {
        const bestMatch = localResults.find(song => 
            song.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(song.title.toLowerCase())
        ) || localResults[0];
        
        console.log('✅ Found local song:', bestMatch.title);
        addMessage(`🎵 Now Playing: ${bestMatch.title} by ${bestMatch.artist}`, 'bot');
        
        // Play using local music player
        window.localMusicPlayer.playSong(bestMatch.id);
        
        // Update now playing info
        updateNowPlaying({ title: bestMatch.title, artist: bestMatch.artist, movie: bestMatch.movie });
        
        return;
    }
    
    // If not found locally, show available songs
    console.log('❌ Song not found in local database');
    addMessage(`❌ "${title}" not found in local database. Here are available songs:`, 'bot');
    
    // Show available local songs
    showAvailableLocalSongs();
}

// Show available local songs
function showAvailableLocalSongs() {
    if (!window.tamilSongsDB) {
        addMessage('❌ Local songs database not loaded', 'bot');
        return;
    }
    
    addMessage('🔍 Checking for available MP3 files...', 'bot');
    
    // Check file availability first
    window.localMusicPlayer.checkAvailableFiles().then(() => {
        window.localMusicPlayer.showFileStatus();
        
        const availableSongs = window.localMusicPlayer.getAvailableSongs();
        const missingSongs = window.localMusicPlayer.getMissingSongs();
        
        if (availableSongs.length === 0) {
            addMessage(`
                <div class="no-files-container">
                    <h3>📁 No MP3 Files Found</h3>
                    <p>To play songs, you need to add MP3 files to your device:</p>
                    <div class="quick-setup">
                        <h4>🚀 Quick Setup:</h4>
                        <ol>
                            <li>Run <code>setup-songs.bat</code> in your project folder</li>
                            <li>Download Tamil song MP3 files</li>
                            <li>Rename and copy them to the audio-samples folder</li>
                            <li>Restart the chatbot</li>
                        </ol>
                    </div>
                    <p><strong>Example:</strong> Download "Aaluma Doluma" and save as <code>aaluma_doluma.mp3</code></p>
                </div>
            `, 'bot');
        } else {
            addMessage(`🎵 Found ${availableSongs.length} songs ready to play! Click any available song above to play it.`, 'bot');
        }
    });
}

// Play local song by ID
function playLocalSong(songId) {
    console.log('🎵 Playing local song ID:', songId);
    
    const song = window.tamilSongsDB[songId];
    if (song) {
        addMessage(`🎵 Playing: ${song.title} by ${song.artist}`, 'bot');
        window.localMusicPlayer.playSong(songId);
    } else {
        addMessage('❌ Song not found in database', 'bot');
    }
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
    
    // Update now playing info
    updateNowPlaying({ title: title, artist: 'YouTube Search Result', movie: '' });
    
    // Initialize YouTube player with the video
    if (typeof YT !== 'undefined' && YT.Player) {
        initYouTubePlayer(videoId);
    } else {
        // If YouTube API not ready, wait and try again
        setTimeout(() => {
            if (typeof YT !== 'undefined' && YT.Player) {
                initYouTubePlayer(videoId);
            } else {
                // Fallback: open in new tab
                addMessage(`🎵 Playing: ${title}`, 'bot');
                window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            }
        }, 1000);
    }
}

// Socket event listeners
socket.on('bot', function(data) {
    console.log('Received bot message:', data);
    
    // Display the AI text response
    if (data.text) {
        addMessage(data.text, 'bot');
    }
    
    // Handle music-control commands from AI
    if (data.musicControl) {
        console.log('Processing music-control:', data.musicControl);
        processMusicControl(data.musicControl);
    }
    
    // Legacy handlers for backwards compatibility
    if (data.type === 'curated_playlist' && data.playlist) {
        displayCuratedPlaylist(data.playlist, data.autoPlay);
    } else if (data.type === 'artist_playlist' && data.playlist) {
        displayCuratedPlaylist(data.playlist, data.autoPlay);
    } else if (data.type === 'youtube_search_results' && data.searchResults) {
        addYouTubeResults(data.searchResults);
    } else if (data.playlists && data.playlists.length > 0) {
        addPlaylistCards(data.playlists);
    } else if (data.youtubeResults && data.youtubeResults.length > 0) {
        addYouTubeResults(data.youtubeResults);
    } else if (data.platformLinks) {
        addPlatformLinks(data.platformLinks, data.songName || 'this song');
    }
    
    // Show platform buttons for music-related responses
    if (data.showPlatformButtons || 
        data.type?.includes('music') || 
        data.followUp === 'language_preference' || 
        data.followUp === 'mood_preference') {
        setTimeout(() => {
            addPlatformButtons();
        }, 500);
    }
});

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

// Receive a globally broadcast shuffled playlist (Spotify recommendations)
socket.on('global_playlist', function(data) {
    console.log('Received global playlist broadcast:', data);
    if (playlistUI && data && data.tracks) {
        playlistUI.displayExternalPlaylist(data.tracks, 'Global Shuffle');
        addMessage(`🌐 Global playlist broadcast received (${data.count} tracks)`, 'bot');
    }
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

// Test YouTube functionality
function testYouTubePlayer() {
    console.log('Testing YouTube Player...');
    
    // Test with a known working video
    const testVideoId = 'YR12Z8f1Dh8'; // Why This Kolaveri Di
    
    addMessage('🧪 Testing YouTube Player with "Why This Kolaveri Di"...', 'bot');
    
    // Use the fixed playSong function to test video playback
    playSong('Why This Kolaveri Di', 'Dhanush');
}

// Make test function available globally
window.testYouTubePlayer = testYouTubePlayer;

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
    
    // Show the YouTube player container
    const youtubePlayerDiv = document.getElementById('youtubePlayer');
    const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const customPlayer = document.getElementById('customPlayer');
    
    if (youtubePlayerDiv) youtubePlayerDiv.style.display = 'block';
    if (audioPlayerContainer) audioPlayerContainer.style.display = 'none';
    if (customPlayer) customPlayer.style.display = 'none';
    
    youtubePlayer = new YT.Player('youtubePlayer', {
        height: '300',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'showinfo': 0,
            'iv_load_policy': 3,
            'disablekb': 0,
            'playsinline': 1
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

// Player error callback - Enhanced with deployed API support
function onPlayerError(event) {
    console.log('❌ YouTube player error:', event.data);
    const errorMessages = {
        2: 'Invalid video ID or parameter',
        5: 'HTML5 player error (try different video)', 
        100: 'Video not found or private',
        101: 'Video embedding disabled by owner',
        150: 'Video embedding disabled by owner'
    };
    
    const errorMsg = errorMessages[event.data] || 'Video playback error';
    console.log('YouTube Error Details:', errorMsg);
    
    updatePlayerStatus(`❌ ${errorMsg} - Finding alternative...`);
    
    // Enhanced error recovery with your deployed API
    setTimeout(async () => {
        try {
            // First try alternative videos from API if available
            if (window.currentVideoOptions && window.currentVideoOptions.length > 1) {
                console.log('🔄 Trying next video from API results...');
                tryAlternativeVideo();
                return;
            }
            
            // If no alternatives, search for new videos using your API
            if (window.currentSongInfo) {
                console.log('� Searching for new videos using deployed API...');
                const newOptions = await getVideoOptions(window.currentSongInfo);
                
                if (newOptions && newOptions.length > 0) {
                    window.currentVideoOptions = newOptions;
                    window.currentVideoIndex = 0;
                    
                    // Try the first result from API
                    const newVideoId = newOptions[0].videoId;
                    if (newVideoId && newVideoId !== youtubePlayer?.getVideoData()?.video_id) {
                        console.log('🎬 Using new API result:', newVideoId);
                        youtubePlayer.loadVideoById(newVideoId);
                        updatePlayerStatus(`🔄 Trying: ${newOptions[0].title}`);
                        return;
                    }
                }
            }
            
            // Final fallback to hardcoded working videos
            console.log('🔄 Using hardcoded fallback videos...');
            const fallbackVideoId = getWorkingYouTubeVideoId(window.currentSongInfo || {title: 'Tamil Song'});
            
            if (fallbackVideoId && fallbackVideoId !== youtubePlayer?.getVideoData()?.video_id) {
                console.log('🎬 Using hardcoded fallback:', fallbackVideoId);
                youtubePlayer.loadVideoById(fallbackVideoId);
                updatePlayerStatus('🎵 Playing alternative Tamil song');
            } else {
                // Last resort - guaranteed working video
                console.log('🎬 Using guaranteed working video');
                youtubePlayer.loadVideoById('YR12Z8f1Dh8'); // Why This Kolaveri Di
                updatePlayerStatus('🎵 Playing popular Tamil song');
            }
            
        } catch (error) {
            console.error('❌ Error recovery failed:', error);
            switchToAudioFallback();
        }
    }, 2000);
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
        // Exact song title matches (all verified embeddable)
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
        'Mandram Vantha Thendralukku': 'J7W1WJd74fM',
        'Poove Poochudava': 'x6Q7c9RyMzk',
        'Thendral Vanthu': 'dzQ99-AqjJI',
        'Kathalae Kathalae': 'CiFX5rJnhLk',
        'Pachai Nirame': 'SZRcnKDMHqA',
        'Enna Sona': 'b4WDbFCahoE',
        'Mersalaayitten': 'xNcdGVJXJaU',
        'Anbe Anbe': 'IQlr2Jjf-6E',
        'Oru Maalai': 'QBZOeItPJb8',
        'Thalapathy Vijay Songs': 'bhZGhtKAKTU',
        'Ilaiyaraaja Songs': 'kCyA-oYp57Y',
        'AR Rahman Songs': 'CiFX5rJnhLk',
        'Anirudh Songs': 'vkqiC4KPeDs',
        'Yuvan Shankar Raja Songs': 'HiqmZLOuCMY',
        
        // Alternative embeddable videos for common searches
        'Tamil Songs': 'vkqiC4KPeDs',
        'Happy Tamil Songs': 'HiqmZLOuCMY',
        'Sad Tamil Songs': 'CiFX5rJnhLk',
        'Love Tamil Songs': 'gQNDm3S7FLc',
        'Dance Tamil Songs': 'x6Q7c9RyMzk',
        'Romantic Tamil Songs': 'dzQ99-AqjJI',
        
        // Mood-based fallbacks (all verified embeddable)
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

// Enhanced YouTube search using local server
async function searchYouTubeInBackend(songInfo) {
    try {
        console.log('🔍 Searching YouTube API for:', songInfo.title, 'by', songInfo.artist);
        
        // First, try the working video database for exact matches
        const hardcodedVideoId = getWorkingYouTubeVideoId(songInfo);
        if (hardcodedVideoId) {
            console.log('✅ Found hardcoded video ID:', hardcodedVideoId, 'for', songInfo.title);
            return hardcodedVideoId;
        }
        
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
            updatePlayerStatus(`🎬 Found: ${data.title}`);
            return data.videoId;
        } else {
            console.log('❌ YouTube API search unsuccessful');
            // Fallback to hardcoded videos if API fails
            const fallbackVideoId = getWorkingYouTubeVideoId(songInfo);
            if (fallbackVideoId) {
                console.log('🔄 Using fallback video ID:', fallbackVideoId);
                return fallbackVideoId;
            }
            return null;
        }
    } catch (error) {
        console.error('❌ YouTube API search error:', error);
        // Fallback to hardcoded videos if API fails
        const fallbackVideoId = getWorkingYouTubeVideoId(songInfo);
        if (fallbackVideoId) {
            console.log('🔄 Using fallback video ID after error:', fallbackVideoId);
            return fallbackVideoId;
        }
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
    
    // Use the local music system for playlist songs
    playSong(song.title, song.artist);
}

// New Real Music System Functions

// Display song recommendations with play buttons
function displaySongRecommendations(songs, mood) {
    const recommendationsHtml = `
        <div class="song-recommendations">
            <h3>🎵 Recommended Songs for ${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood</h3>
            <div class="songs-grid">
                ${songs.map((song, index) => `
                    <div class="song-card" onclick="playRecommendedSong(${index}, '${mood}')">
                        <div class="song-card-emoji">${getMoodEmoji(mood)}</div>
                        <div class="song-card-title">${song.title}</div>
                        <div class="song-card-artist">${song.artist}</div>
                        <div class="song-card-movie">${song.movie}</div>
                        <button class="play-card-btn">▶️ Play Now</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="playMoodPlaylist('${mood}')" class="play-all-btn">
                🎵 Play All ${mood.charAt(0).toUpperCase() + mood.slice(1)} Songs
            </button>
        </div>
    `;
    
    addBotMessage(recommendationsHtml);
}

// Play recommended song
function playRecommendedSong(index, mood) {
    if (window.realMusicPlayer) {
        const songs = window.realMusicPlayer.getSongsByMood(mood);
        if (songs[index]) {
            window.realMusicPlayer.playSong(songs[index]);
        }
    }
}

// Play entire mood playlist
function playMoodPlaylist(mood) {
    if (window.realMusicPlayer) {
        const songs = window.realMusicPlayer.getSongsByMood(mood);
        addMessage(`🎵 Playing ${mood} playlist (${songs.length} songs)`, 'bot');
        
        // Play first song
        if (songs.length > 0) {
            window.realMusicPlayer.playSong(songs[0]);
            
            // Queue remaining songs
            setTimeout(() => {
                addMessage(`📋 Queued ${songs.length - 1} more songs`, 'bot');
            }, 1000);
        }
    }
}

// Display all available songs
function displayAllSongs() {
    if (window.realMusicPlayer) {
        const allSongs = window.realMusicPlayer.getAllSongs();
        
        const songsHtml = `
            <div class="all-songs-list">
                <h3>🎵 All Available Songs (${allSongs.length} total)</h3>
                <div class="songs-list-grid">
                    ${allSongs.map((song, index) => `
                        <div class="song-list-item" onclick="playDirectSong(${index})">
                            <div class="song-list-info">
                                <div class="song-list-title">${song.title}</div>
                                <div class="song-list-artist">${song.artist}</div>
                                <div class="song-list-meta">
                                    <span class="mood-tag mood-tag-${song.mood}">${song.mood}</span>
                                    <span class="lang-tag">${song.language}</span>
                                </div>
                            </div>
                            <button class="play-list-btn">▶️</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        addBotMessage(songsHtml);
    }
}

// Play song directly by index
function playDirectSong(index) {
    if (window.realMusicPlayer) {
        const allSongs = window.realMusicPlayer.getAllSongs();
        if (allSongs[index]) {
            window.realMusicPlayer.playSong(allSongs[index]);
        }
    }
}

// Handle direct play command
function handleDirectSongPlay(message) {
    const query = message.replace(/^play\s+/i, '').trim();
    
    if (window.realMusicPlayer) {
        const results = window.realMusicPlayer.searchSongs(query);
        
        if (results.length === 0) {
            addMessage(`❌ Sorry, I couldn't find "${query}". Try "show songs" to see all available music!`, 'bot');
            return;
        }
        
        if (results.length === 1) {
            // Single result - play immediately
            window.realMusicPlayer.playSong(results[0]);
        } else {
            // Multiple results - show options
            searchAndDisplaySongs(query);
        }
    }
}

// Search and display matching songs
function searchAndDisplaySongs(query) {
    if (window.realMusicPlayer) {
        const results = window.realMusicPlayer.searchSongs(query);
        
        if (results.length === 0) {
            addMessage(`❌ No songs found for "${query}"`, 'bot');
            return;
        }
        
        const searchHtml = `
            <div class="search-results">
                <h3>🔍 Found ${results.length} song${results.length > 1 ? 's' : ''} for "${query}"</h3>
                <div class="search-results-list">
                    ${results.map((song, index) => `
                        <div class="search-result-item" onclick="playSearchResult('${query}', ${index})">
                            <div class="search-result-info">
                                <div class="search-result-title">${song.title}</div>
                                <div class="search-result-artist">${song.artist} • ${song.movie}</div>
                            </div>
                            <button class="play-search-btn">▶️ Play</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        addBotMessage(searchHtml);
    }
}

// Play from search results
function playSearchResult(query, index) {
    if (window.realMusicPlayer) {
        const results = window.realMusicPlayer.searchSongs(query);
        if (results[index]) {
            window.realMusicPlayer.playSong(results[index]);
        }
    }
}

/**
 * Process music-control commands from AI
 * @param {Object} control - Music control object with action, mode, mood, language, etc.
 */
async function processMusicControl(control) {
    if (!musicPlayer) {
        console.error('Music player not initialized');
        return;
    }
    
    const { action, mode, mood, language, songId, songs } = control;
    console.log('Music Control:', { action, mode, mood, language, songId, songsCount: songs?.length });
    
    // Handle different actions
    switch (action) {
        case 'play':
            if (mode === 'single' && songId) {
                // Play single song by ID
                try {
                    const response = await fetch(`/api/songs/${songId}`);
                    const data = await response.json();
                    if (data.success && data.song) {
                        musicPlayer.play(data.song);
                        addMessage(`🎵 Now playing: ${data.song.title} by ${data.song.artist}`, 'system');
                    }
                } catch (error) {
                    console.error('Error fetching song:', error);
                }
            } else if (mode === 'playlist' && songs && songs.length > 0) {
                // Play playlist
                musicPlayer.playPlaylist(songs);
                addMessage(`🎵 Playing ${songs.length} songs${mood ? ` (${mood} mood)` : ''}`, 'system');
            } else if (mode === 'playlist' && (mood || language)) {
                // Fetch and play songs by mood/language
                try {
                    let url = '/api/songs';
                    if (mood && language) {
                        // For now, fetch all and filter client-side
                        const response = await fetch(url);
                        const data = await response.json();
                        if (data.success) {
                            const filtered = data.songs.filter(s => 
                                s.moods.includes(mood.toLowerCase()) && 
                                s.language.toLowerCase() === language.toLowerCase()
                            );
                            if (filtered.length > 0) {
                                musicPlayer.playPlaylist(filtered);
                                addMessage(`🎵 Playing ${filtered.length} ${mood} ${language} songs`, 'system');
                            } else {
                                addMessage(`❌ No ${mood} ${language} songs found`, 'system');
                            }
                        }
                    } else if (mood) {
                        const response = await fetch(`/api/songs/mood/${mood}`);
                        const data = await response.json();
                        if (data.success && data.songs.length > 0) {
                            musicPlayer.playPlaylist(data.songs);
                            addMessage(`🎵 Playing ${data.songs.length} ${mood} songs`, 'system');
                        }
                    } else if (language) {
                        const response = await fetch(`/api/songs/language/${language}`);
                        const data = await response.json();
                        if (data.success && data.songs.length > 0) {
                            musicPlayer.playPlaylist(data.songs);
                            addMessage(`🎵 Playing ${data.songs.length} ${language} songs`, 'system');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching songs:', error);
                }
            }
            break;
            
        case 'pause':
            musicPlayer.pause();
            addMessage('⏸️ Paused', 'system');
            break;
            
        case 'resume':
            musicPlayer.resume();
            addMessage('▶️ Resumed', 'system');
            break;
            
        case 'next':
            musicPlayer.next();
            break;
            
        case 'previous':
            musicPlayer.previous();
            break;
            
        case 'shuffle':
            musicPlayer.shuffle();
            addMessage('🔀 Playlist shuffled', 'system');
            break;
            
        default:
            console.log('Unknown music control action:', action);
    }
}

/**
 * Update Now Playing UI
 * @param {Object} song - Currently playing song
 */
function updateNowPlayingUI(song) {
    // You can add UI updates here if you have a now-playing display
    console.log('Now Playing UI Update:', song.title);
    
    // Add a subtle notification in chat
    const notification = document.createElement('div');
    notification.className = 'now-playing-notification';
    notification.innerHTML = `
        <div style="background: rgba(78, 205, 196, 0.1); padding: 0.8rem; border-radius: 12px; border-left: 3px solid var(--accent-primary); margin: 0.5rem 0;">
            <div style="font-size: 0.85rem; color: var(--accent-primary); font-weight: 600; margin-bottom: 0.3rem;">
                🎵 Now Playing
            </div>
            <div style="font-size: 1rem; color: var(--text-primary); font-weight: bold; margin-bottom: 0.2rem;">
                ${song.title}
            </div>
            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                ${song.artist} • ${song.movie} • ${song.language}
            </div>
        </div>
    `;
    
    const messages = document.getElementById('chatMessages');
    if (messages) {
        messages.appendChild(notification);
        messages.scrollTop = messages.scrollHeight;
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Get mood emoji
function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊',
        sad: '💙',
        romantic: '💕',
        energetic: '⚡',
        relaxing: '🌸'
    };
    return emojis[mood] || '🎵';
}

// Legacy Spotify Embed Functions (keep for compatibility)
async function handleSpotifyPlay(message) {
    const playRegex = /(?:play|search)\s+(.+)/i;
    const match = message.match(playRegex);
    
    if (!match) {
        addMessage('❌ Please specify a song name. Example: "play Vaseegara"', 'bot');
        return;
    }
    
    const songName = match[1].trim();
    if (window.spotifyEmbed) {
        window.spotifyEmbed.searchSongs(songName);
    }
}

function handleSpotifyPause() {
    addMessage('⏸️ Use the player controls in the music player above', 'bot');
}

function handleSpotifyResume() {
    addMessage('▶️ Use the player controls in the music player above', 'bot');
}

// Playlist Command Handlers
function handleCreateRandomPlaylist(message) {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    // Extract count if specified
    const countMatch = message.match(/(\d+)/);
    const count = countMatch ? parseInt(countMatch[1]) : 5;
    
    const result = window.playlistManager.createRandomPlaylist(count);
    
    if (result.success) {
        const playlistHtml = `
            <div class="playlist-container">
                <div class="playlist-header">
                    <h3>🎲 Random Playlist Created</h3>
                    <div class="playlist-meta">${result.count} songs</div>
                </div>
                <div class="playlist-songs">
                    ${result.playlist.map((song, index) => `
                        <div class="playlist-song-item">
                            <div class="playlist-song-number">${index + 1}</div>
                            <div class="playlist-song-info">
                                <div class="playlist-song-title">${song.title}</div>
                                <div class="playlist-song-artist">${song.artist}</div>
                            </div>
                            <div class="playlist-song-mood">${song.mood || 'Mixed'}</div>
                            <button onclick="window.playlistManager.playPlaylist(${index})" class="platform-btn">▶️ Play</button>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.playlistManager.playPlaylist(0)" class="platform-btn">🎵 Play All</button>
                    <button onclick="window.playlistManager.shufflePlaylist()" class="platform-btn">🔀 Shuffle</button>
                </div>
            </div>
        `;
        
        addBotMessage(playlistHtml);
    } else {
        addMessage(`❌ ${result.message}`, 'bot');
    }
}

function handleCreateMoodPlaylist(message) {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    // Extract mood from message
    const moods = window.playlistManager.getAvailableMoods();
    const foundMood = moods.find(mood => 
        message.toLowerCase().includes(mood.toLowerCase())
    );
    
    if (!foundMood) {
        addMessage(`🎭 Please specify a mood: ${moods.join(', ')}`, 'bot');
        return;
    }
    
    const result = window.playlistManager.createMoodPlaylist(foundMood);
    
    if (result.success) {
        const playlistHtml = `
            <div class="playlist-container">
                <div class="playlist-header">
                    <h3>🎭 ${result.mood} Playlist</h3>
                    <div class="playlist-meta">${result.count} songs</div>
                </div>
                <div class="playlist-songs">
                    ${result.playlist.map((song, index) => `
                        <div class="playlist-song-item">
                            <div class="playlist-song-number">${index + 1}</div>
                            <div class="playlist-song-info">
                                <div class="playlist-song-title">${song.title}</div>
                                <div class="playlist-song-artist">${song.artist}</div>
                            </div>
                            <div class="playlist-song-mood">${song.mood}</div>
                            <button onclick="window.playlistManager.playPlaylist(${index})" class="platform-btn">▶️ Play</button>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.playlistManager.playPlaylist(0)" class="platform-btn">🎵 Play All</button>
                    <button onclick="window.playlistManager.shufflePlaylist()" class="platform-btn">🔀 Shuffle</button>
                </div>
            </div>
        `;
        
        addBotMessage(playlistHtml);
    } else {
        addMessage(`❌ ${result.message}`, 'bot');
        addMessage(`Available moods: ${result.availableMoods.join(', ')}`, 'bot');
    }
}

function handleCreateArtistPlaylist(message) {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    // Extract artist from message
    const artists = window.playlistManager.getAvailableArtists();
    const foundArtist = artists.find(artist => 
        message.toLowerCase().includes(artist.toLowerCase())
    );
    
    if (!foundArtist) {
        addMessage(`🎤 Please specify an artist: ${artists.join(', ')}`, 'bot');
        return;
    }
    
    const result = window.playlistManager.createArtistPlaylist(foundArtist);
    
    if (result.success) {
        const playlistHtml = `
            <div class="playlist-container">
                <div class="playlist-header">
                    <h3>🎤 ${result.artist} Playlist</h3>
                    <div class="playlist-meta">${result.count} songs</div>
                </div>
                <div class="playlist-songs">
                    ${result.playlist.map((song, index) => `
                        <div class="playlist-song-item">
                            <div class="playlist-song-number">${index + 1}</div>
                            <div class="playlist-song-info">
                                <div class="playlist-song-title">${song.title}</div>
                                <div class="playlist-song-artist">${song.artist}</div>
                            </div>
                            <div class="playlist-song-mood">${song.mood || 'Mixed'}</div>
                            <button onclick="window.playlistManager.playPlaylist(${index})" class="platform-btn">▶️ Play</button>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.playlistManager.playPlaylist(0)" class="platform-btn">🎵 Play All</button>
                    <button onclick="window.playlistManager.shufflePlaylist()" class="platform-btn">🔀 Shuffle</button>
                </div>
            </div>
        `;
        
        addBotMessage(playlistHtml);
    } else {
        addMessage(`❌ ${result.message}`, 'bot');
        addMessage(`Available artists: ${result.availableArtists.join(', ')}`, 'bot');
    }
}

function handleCreateSmartPlaylist() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    const result = window.playlistManager.createSmartPlaylist();
    
    if (result.success) {
        const hour = new Date().getHours();
        let timeEmoji = '🌅';
        let timeDescription = 'Morning Energy';
        
        if (hour >= 12 && hour < 17) {
            timeEmoji = '☀️';
            timeDescription = 'Afternoon Vibes';
        } else if (hour >= 17 && hour < 21) {
            timeEmoji = '🌆';
            timeDescription = 'Evening Romance';
        } else if (hour >= 21 || hour < 6) {
            timeEmoji = '🌙';
            timeDescription = 'Night Chill';
        }
        
        const playlistHtml = `
            <div class="playlist-container">
                <div class="playlist-header">
                    <h3>${timeEmoji} Smart Playlist - ${timeDescription}</h3>
                    <div class="playlist-meta">${result.count} songs for ${result.mood} mood</div>
                </div>
                <div class="playlist-songs">
                    ${result.playlist.map((song, index) => `
                        <div class="playlist-song-item">
                            <div class="playlist-song-number">${index + 1}</div>
                            <div class="playlist-song-info">
                                <div class="playlist-song-title">${song.title}</div>
                                <div class="playlist-song-artist">${song.artist}</div>
                            </div>
                            <div class="playlist-song-mood">${song.mood}</div>
                            <button onclick="window.playlistManager.playPlaylist(${index})" class="platform-btn">▶️ Play</button>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.playlistManager.playPlaylist(0)" class="platform-btn">🎵 Play All</button>
                    <button onclick="window.playlistManager.shufflePlaylist()" class="platform-btn">🔀 Shuffle</button>
                </div>
            </div>
        `;
        
        addBotMessage(playlistHtml);
    } else {
        addMessage(`❌ ${result.message}`, 'bot');
    }
}

function handlePlayPlaylist() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    const playlistInfo = window.playlistManager.getCurrentPlaylistInfo();
    
    if (playlistInfo.playlist.length === 0) {
        addMessage('❌ No playlist loaded. Create a playlist first!', 'bot');
        return;
    }
    
    window.playlistManager.playPlaylist(0);
    addMessage(`🎵 Playing playlist (${playlistInfo.playlist.length} songs)`, 'bot');
}

function handleNextSong() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    window.playlistManager.nextSong().then(result => {
        if (result.success) {
            addMessage(`⏭️ Playing: ${result.song.title} by ${result.song.artist}`, 'bot');
        } else {
            addMessage(`❌ ${result.message}`, 'bot');
        }
    });
}

function handlePreviousSong() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    window.playlistManager.previousSong().then(result => {
        if (result.success) {
            addMessage(`⏮️ Playing: ${result.song.title} by ${result.song.artist}`, 'bot');
        } else {
            addMessage(`❌ ${result.message}`, 'bot');
        }
    });
}

function handleToggleShuffle() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    const shuffleState = window.playlistManager.toggleShuffle();
    addMessage(`🔀 Shuffle ${shuffleState ? 'enabled' : 'disabled'}`, 'bot');
}

function handleToggleRepeat() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    const repeatState = window.playlistManager.toggleRepeat();
    addMessage(`🔁 Repeat ${repeatState ? 'enabled' : 'disabled'}`, 'bot');
}

function handleShowCurrentPlaylist() {
    if (!window.playlistManager) {
        addMessage('❌ Playlist system not ready. Please refresh the page.', 'bot');
        return;
    }
    
    const playlistInfo = window.playlistManager.getCurrentPlaylistInfo();
    
    if (playlistInfo.playlist.length === 0) {
        addMessage('📭 No playlist currently loaded.', 'bot');
        addMessage('💡 Try: "create random playlist" or "create mood playlist romantic"', 'bot');
        return;
    }
    
    const currentSong = playlistInfo.currentSong;
    const statusHtml = `
        <div class="playlist-container">
            <div class="playlist-header">
                <h3>📋 Current Playlist</h3>
                <div class="playlist-meta">
                    ${playlistInfo.playlist.length} songs • 
                    ${playlistInfo.isPlaying ? '▶️ Playing' : '⏸️ Paused'} • 
                    🔀 ${playlistInfo.shuffle ? 'On' : 'Off'} • 
                    🔁 ${playlistInfo.repeat ? 'On' : 'Off'}
                </div>
            </div>
            ${currentSong ? `
                <div style="background: rgba(78, 205, 196, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <strong>🎵 Now Playing:</strong> ${currentSong.title} by ${currentSong.artist}
                </div>
            ` : ''}
            <div class="playlist-songs">
                ${playlistInfo.playlist.map((song, index) => `
                    <div class="playlist-song-item ${index === playlistInfo.currentIndex ? 'playing' : ''}">
                        <div class="playlist-song-number">${index === playlistInfo.currentIndex ? '▶️' : index + 1}</div>
                        <div class="playlist-song-info">
                            <div class="playlist-song-title">${song.title}</div>
                            <div class="playlist-song-artist">${song.artist}</div>
                        </div>
                        <div class="playlist-song-mood">${song.mood || 'Mixed'}</div>
                        <button onclick="window.playlistManager.playPlaylist(${index})" class="platform-btn">▶️ Play</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    addBotMessage(statusHtml);
}

// Global functions (make them accessible to onclick handlers)
window.playSong = playSong;
window.playSongByIndex = playSongByIndex;
window.playLocalSong = playLocalSong;
window.showAvailableLocalSongs = showAvailableLocalSongs;
window.playAllSongs = playAllSongs;
window.shufflePlaylist = shufflePlaylist;
window.nextSong = nextSong;
window.togglePlayback = togglePlayback;

// Playlist global functions
window.handleCreateRandomPlaylist = handleCreateRandomPlaylist;
window.handleCreateMoodPlaylist = handleCreateMoodPlaylist;
window.handleCreateArtistPlaylist = handleCreateArtistPlaylist;
window.handleCreateSmartPlaylist = handleCreateSmartPlaylist;
window.handlePlayPlaylist = handlePlayPlaylist;
window.handleNextSong = handleNextSong;
window.handlePreviousSong = handlePreviousSong;
window.handleToggleShuffle = handleToggleShuffle;
window.handleToggleRepeat = handleToggleRepeat;
window.handleShowCurrentPlaylist = handleShowCurrentPlaylist;

console.log('Client script loaded successfully');