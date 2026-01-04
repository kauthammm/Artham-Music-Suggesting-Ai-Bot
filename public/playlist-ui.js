/**
 * Spotify-Style Playlist UI Component
 * Shows concrete song lists with play buttons, counts, and controls
 */

class PlaylistUI {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentPlaylist = null;
  }

  /**
   * Display a Spotify-style playlist
   * @param {Object} playlist - Playlist object from API
   */
  async displayPlaylist(mood, language) {
    if (!this.container) {
      console.error('Playlist container not found');
      return;
    }

    try {
      // Fetch playlist from API
      const response = await fetch(`/api/playlist/${mood}/${language}`);
      const playlist = await response.json();

      this.currentPlaylist = playlist;

      if (!playlist.success) {
        this.showNoSongsMessage(playlist);
        return;
      }

      // Render playlist
      this.container.innerHTML = this.renderPlaylistHTML(playlist);
      this.attachEventListeners();
      
      // Scroll to playlist
      this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
      console.error('Error loading playlist:', error);
      this.showError('Failed to load playlist. Please try again.');
    }
  }

  /**
   * Render the playlist HTML (Spotify-style)
   */
  renderPlaylistHTML(playlist) {
    const { title, description, songs, count, mood, language } = playlist;

    return `
      <div class="spotify-playlist">
        <!-- Header -->
        <div class="playlist-header">
          <div class="playlist-cover">
            <i class="fas fa-music"></i>
          </div>
          <div class="playlist-info">
            <span class="playlist-type">Playlist</span>
            <h2 class="playlist-title">${title}</h2>
            <p class="playlist-meta">
              <span class="playlist-count">${count} songs</span>
              <span class="playlist-mood">${mood}</span>
              <span class="playlist-language">${language}</span>
            </p>
          </div>
        </div>

        <!-- Controls -->
        <div class="playlist-controls">
          <button class="play-all-btn" data-action="play-all">
            <i class="fas fa-play"></i> Play All
          </button>
          <button class="shuffle-btn" data-action="shuffle">
            <i class="fas fa-random"></i> Shuffle
          </button>
          <button class="queue-btn" data-action="queue">
            <i class="fas fa-list"></i> Add to Queue
          </button>
        </div>

        <!-- Song List -->
        <div class="song-list-container">
          <div class="song-list-header">
            <div class="col-number">#</div>
            <div class="col-title">TITLE</div>
            <div class="col-artist">ARTIST</div>
            <div class="col-duration">DURATION</div>
            <div class="col-actions"></div>
          </div>
          <div class="song-list-body">
            ${songs.map(song => this.renderSongRow(song)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a single song row
   */
  renderSongRow(song) {
    const duration = song.durationMs 
      ? this.formatDuration(song.durationMs) 
      : '--:--';
      
    const provider = song.provider === 'spotify' ? 'Spotify' : 
                     song.provider === 'youtube' ? 'YouTube' : 
                     song.provider;

    return `
      <div class="song-row" data-song-id="${song.id}">
        <div class="col-number">
          <span class="song-number">${song.position}</span>
          <button class="play-btn-mini" data-action="play-song" data-song-id="${song.id}">
            <i class="fas fa-play"></i>
          </button>
        </div>
        <div class="col-title">
          <div class="song-title-text">${song.title}</div>
          <div class="song-movie">${song.movie || ''}</div>
        </div>
        <div class="col-artist">${song.artist}</div>
        <div class="col-duration">
          ${duration}
          <span class="provider-badge">${provider}</span>
        </div>
        <div class="col-actions">
          <button class="action-btn" data-action="play-next" data-song-id="${song.id}" title="Play Next">
            <i class="fas fa-step-forward"></i>
          </button>
          <button class="action-btn" data-action="add-queue" data-song-id="${song.id}" title="Add to Queue">
            <i class="fas fa-plus"></i>
          </button>
          <button class="action-btn" data-action="share" data-song-id="${song.id}" title="Share">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Show message when no songs are found
   */
  showNoSongsMessage(playlist) {
    const html = `
      <div class="no-songs-message">
        <i class="fas fa-music-slash"></i>
        <h3>No Songs Found</h3>
        <p>${playlist.message}</p>
        ${playlist.alternatives && playlist.alternatives.length > 0 ? `
          <div class="alternatives">
            <h4>Try These Instead:</h4>
            <div class="alternative-buttons">
              ${playlist.alternatives.map(alt => `
                <button class="alternative-btn" data-mood="${alt.mood}" data-language="${alt.language}">
                  ${alt.message}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="playlist-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Attach event listeners to playlist buttons
   */
  attachEventListeners() {
    // Play All button
    const playAllBtn = this.container.querySelector('[data-action="play-all"]');
    if (playAllBtn) {
      playAllBtn.addEventListener('click', () => this.handlePlayAll());
    }

    // Shuffle button
    const shuffleBtn = this.container.querySelector('[data-action="shuffle"]');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => this.handleShuffle());
    }

    // Individual play buttons
    const playBtns = this.container.querySelectorAll('[data-action="play-song"]');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const songId = e.currentTarget.dataset.songId;
        this.handlePlaySong(songId);
      });
    });

    // Alternative playlist buttons
    const altBtns = this.container.querySelectorAll('.alternative-btn');
    altBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mood = e.currentTarget.dataset.mood;
        const language = e.currentTarget.dataset.language;
        this.displayPlaylist(mood, language);
      });
    });

    // Add hover effects to song rows
    const songRows = this.container.querySelectorAll('.song-row');
    songRows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.querySelector('.song-number').style.display = 'none';
        row.querySelector('.play-btn-mini').style.display = 'flex';
      });
      row.addEventListener('mouseleave', () => {
        row.querySelector('.song-number').style.display = 'block';
        row.querySelector('.play-btn-mini').style.display = 'none';
      });
    });
  }

  /**
   * Handle Play All action
   */
  handlePlayAll() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs) return;
    
    console.log('Playing all songs from playlist');
    if (window.musicPlayer) {
      window.musicPlayer.playPlaylist(this.currentPlaylist.songs, 0);
      this.showNotification(`Playing ${this.currentPlaylist.count} songs`);
    }
  }

  /**
   * Handle Shuffle action
   */
  handleShuffle() {
    if (!this.currentPlaylist || !this.currentPlaylist.songs) return;
    
    console.log('Shuffling playlist');
    if (window.musicPlayer) {
      const shuffled = [...this.currentPlaylist.songs].sort(() => Math.random() - 0.5);
      window.musicPlayer.playPlaylist(shuffled, 0);
      this.showNotification('Shuffling playlist');
    }
  }

  /**
   * Handle Play Song action
   */
  handlePlaySong(songId) {
    const song = this.currentPlaylist.songs.find(s => s.id === songId);
    if (!song) return;
    
    console.log('Playing song:', song.title);
    if (window.musicPlayer) {
      window.musicPlayer.play(song);
      this.showNotification(`Now playing: ${song.title}`);
    }
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create or update notification element
    let notification = document.querySelector('.playlist-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'playlist-notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  /**
   * Format duration from milliseconds to MM:SS
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Display an externally provided playlist (e.g., global Spotify broadcast)
   * @param {Array} tracks - Array of track objects
   * @param {String} title - Title to show
   */
  displayExternalPlaylist(tracks, title = 'Global Playlist') {
    if (!this.container) return;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      this.showError('No tracks to display');
      return;
    }
    // Normalize track objects to internal song shape
    const normalized = tracks.map((t, idx) => ({
      id: t.id || `ext-${idx}`,
      title: t.title || t.name || 'Unknown Title',
      artist: t.artist || (Array.isArray(t.artists) ? t.artists.join(', ') : t.artist) || 'Unknown Artist',
      movie: t.album || '',
      durationMs: t.durationMs || t.duration_ms || 0,
      provider: t.provider || 'spotify',
      position: idx + 1
    }));
    const playlist = {
      success: true,
      title,
      description: 'Shared broadcast playlist',
      songs: normalized,
      count: normalized.length,
      mood: 'shared',
      language: 'multi'
    };
    this.currentPlaylist = playlist;
    this.container.innerHTML = this.renderPlaylistHTML(playlist);
    this.attachEventListeners();
    this.showNotification(`Loaded ${playlist.count} shared tracks`);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlaylistUI;
}
