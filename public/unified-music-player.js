/**
 * Unified Music Player for Online Streaming
 * 
 * Supports:
 * - Spotify embeds
 * - YouTube players
 * - Direct audio streams
 * 
 * No local MP3 files required!
 */

class UnifiedMusicPlayer {
  constructor() {
    this.currentSong = null;
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.7;
    this.playerType = null; // 'spotify', 'youtube', 'audio'
    this.playerElement = null;
    this.youtubePlayer = null;
    
    // Create player container
    this.createPlayerContainer();
    
    // Event handlers
    this.onSongChange = null;
    this.onPlayStateChange = null;
    this.onPlaylistChange = null;
  }

  /**
   * Create the player container in the DOM
   */
  createPlayerContainer() {
    let container = document.getElementById('unified-player-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'unified-player-container';
      container.className = 'unified-player';
      container.innerHTML = `
        <div class="player-controls">
          <button id="prev-btn" class="control-btn">⏮️</button>
          <button id="play-pause-btn" class="control-btn">▶️</button>
          <button id="next-btn" class="control-btn">⏭️</button>
          <div class="volume-control">
            <span>🔊</span>
            <input type="range" id="volume-slider" min="0" max="100" value="70">
          </div>
        </div>
        <div class="now-playing">
          <div id="song-info">No song playing</div>
        </div>
        <div id="player-embed"></div>
      `;
      document.body.appendChild(container);
      
      // Attach event listeners
      this.attachControlListeners();
    }
  }

  /**
   * Attach event listeners to player controls
   */
  attachControlListeners() {
    document.getElementById('play-pause-btn')?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.resume();
      }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
      this.next();
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
      this.previous();
    });

    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
    });
  }

  /**
   * Play a single song
   * @param {Object} song - Song object from catalog
   */
  play(song) {
    if (!song) return;

    console.log('Playing song:', song.title);
    
    this.currentSong = song;
    this.playlist = [song];
    this.currentIndex = 0;
    
    this.startPlayback(song);
    this.updateNowPlaying();
    
    if (this.onSongChange) {
      this.onSongChange(song);
    }
  }

  /**
   * Play a playlist of songs
   * @param {Array} songs - Array of song objects
   * @param {number} startIndex - Index to start from
   */
  playPlaylist(songs, startIndex = 0) {
    if (!songs || songs.length === 0) return;

    console.log('Playing playlist:', songs.length, 'songs');
    
    this.playlist = songs;
    this.currentIndex = startIndex;
    this.currentSong = songs[startIndex];
    
    this.startPlayback(this.currentSong);
    this.updateNowPlaying();
    
    if (this.onPlaylistChange) {
      this.onPlaylistChange(this.playlist);
    }
    
    if (this.onSongChange) {
      this.onSongChange(this.currentSong);
    }
  }

  /**
   * Start playback for a specific song
   * @param {Object} song - Song to play
   */
  startPlayback(song) {
    const embedContainer = document.getElementById('player-embed');
    if (!embedContainer) return;

    // Clear previous player
    embedContainer.innerHTML = '';
    this.playerElement = null;
    this.youtubePlayer = null;

    // Determine player type and create appropriate embed
    if (song.provider === 'spotify' && song.spotifyId) {
      this.createSpotifyPlayer(song, embedContainer);
    } else if (song.provider === 'youtube' && song.youtubeId) {
      this.createYouTubePlayer(song, embedContainer);
    } else if (song.streamUrl) {
      this.createAudioPlayer(song, embedContainer);
    }

    this.isPlaying = true;
    this.updatePlayButton();
  }

  /**
   * Create Spotify embed player
   */
  createSpotifyPlayer(song, container) {
    this.playerType = 'spotify';
    const iframe = document.createElement('iframe');
    iframe.src = song.streamUrl || `https://open.spotify.com/embed/track/${song.spotifyId}`;
    iframe.width = '100%';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media';
    
    container.appendChild(iframe);
    this.playerElement = iframe;
  }

  /**
   * Create YouTube embed player
   */
  createYouTubePlayer(song, container) {
    this.playerType = 'youtube';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&enablejsapi=1`;
    iframe.width = '100%';
    iframe.height = '315';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    container.appendChild(iframe);
    this.playerElement = iframe;
  }

  /**
   * Create HTML5 audio player
   */
  createAudioPlayer(song, container) {
    this.playerType = 'audio';
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true;
    audio.volume = this.volume;
    audio.src = song.streamUrl;
    
    // Auto-advance to next song when current ends
    audio.addEventListener('ended', () => {
      this.next();
    });
    
    container.appendChild(audio);
    this.playerElement = audio;
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.playerType === 'audio' && this.playerElement) {
      this.playerElement.pause();
    }
    // Note: Spotify and YouTube embeds don't expose pause API easily
    
    this.isPlaying = false;
    this.updatePlayButton();
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.playerType === 'audio' && this.playerElement) {
      this.playerElement.play();
    }
    
    this.isPlaying = true;
    this.updatePlayButton();
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
  }

  /**
   * Play next song in playlist
   */
  next() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.currentSong = this.playlist[this.currentIndex];
    
    this.startPlayback(this.currentSong);
    this.updateNowPlaying();
    
    if (this.onSongChange) {
      this.onSongChange(this.currentSong);
    }
  }

  /**
   * Play previous song in playlist
   */
  previous() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.currentSong = this.playlist[this.currentIndex];
    
    this.startPlayback(this.currentSong);
    this.updateNowPlaying();
    
    if (this.onSongChange) {
      this.onSongChange(this.currentSong);
    }
  }

  /**
   * Shuffle playlist
   */
  shuffle() {
    if (this.playlist.length <= 1) return;
    
    const currentSong = this.currentSong;
    
    // Fisher-Yates shuffle
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
    
    // Find new index of current song
    this.currentIndex = this.playlist.findIndex(s => s.id === currentSong.id);
    if (this.currentIndex === -1) this.currentIndex = 0;
    
    if (this.onPlaylistChange) {
      this.onPlaylistChange(this.playlist);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.playerType === 'audio' && this.playerElement) {
      this.playerElement.volume = this.volume;
    }
  }

  /**
   * Stop playback
   */
  stop() {
    if (this.playerType === 'audio' && this.playerElement) {
      this.playerElement.pause();
      this.playerElement.currentTime = 0;
    }
    
    const embedContainer = document.getElementById('player-embed');
    if (embedContainer) {
      embedContainer.innerHTML = '';
    }
    
    this.isPlaying = false;
    this.currentSong = null;
    this.updatePlayButton();
    this.updateNowPlaying();
  }

  /**
   * Update play/pause button display
   */
  updatePlayButton() {
    const btn = document.getElementById('play-pause-btn');
    if (btn) {
      btn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }
  }

  /**
   * Update now playing display
   */
  updateNowPlaying() {
    const infoDiv = document.getElementById('song-info');
    if (!infoDiv) return;
    
    if (this.currentSong) {
      infoDiv.innerHTML = `
        <div class="song-title">${this.currentSong.title}</div>
        <div class="song-artist">${this.currentSong.artist} • ${this.currentSong.movie}</div>
        <div class="song-meta">${this.currentSong.language} • ${this.currentSong.moods.join(', ')}</div>
      `;
    } else {
      infoDiv.textContent = 'No song playing';
    }
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      currentSong: this.currentSong,
      playlist: this.playlist,
      currentIndex: this.currentIndex,
      isPlaying: this.isPlaying,
      volume: this.volume
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnifiedMusicPlayer;
}
