// Spotify-Style Music Player (YouTube-powered, No Auth Required!)
class SpotifyPlayer {
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 70;
    this.shuffle = false;
    this.repeat = false;
    this.queueVisible = false;
    this.onSongChange = null;
    this.onPlayStateChange = null;
    this.onPlaylistChange = null;
    this.ytPlayer = null;
    this.ytReady = false;
    this.pendingSong = false;
    this.createPlayerUI();
  }

  createPlayerUI() {
    if (document.getElementById('spotify-bar')) return;
    
    const html = `
      <div id="spotify-bar" class="spotify-bar">
        <div class="sb-left">
          <div class="sb-art" id="sb-art"><i class="fas fa-music"></i></div>
          <div class="sb-info">
            <div id="sb-title">No song playing</div>
            <div id="sb-artist">Select music to play</div>
          </div>
        </div>
        
        <div class="sb-center">
          <div class="sb-buttons">
            <button id="sb-shuffle" class="sb-btn" title="Shuffle"><i class="fas fa-random"></i></button>
            <button id="sb-prev" class="sb-btn"><i class="fas fa-step-backward"></i></button>
            <button id="sb-play" class="sb-btn sb-play-btn"><i class="fas fa-play"></i></button>
            <button id="sb-next" class="sb-btn"><i class="fas fa-step-forward"></i></button>
            <button id="sb-repeat" class="sb-btn" title="Repeat"><i class="fas fa-repeat"></i></button>
          </div>
          <div class="sb-progress">
            <span id="sb-time">0:00</span>
            <div class="sb-bar" id="sb-bar"><div class="sb-fill" id="sb-fill"></div></div>
            <span id="sb-duration">0:00</span>
          </div>
        </div>
        
        <div class="sb-right">
          <button id="sb-queue" class="sb-btn"><i class="fas fa-list"></i></button>
          <input type="range" id="sb-volume" class="sb-volume" min="0" max="100" value="70">
          <button id="sb-fullscreen" class="sb-btn"><i class="fas fa-expand"></i></button>
        </div>
        
        <div id="sb-yt" style="display:none;"></div>
        <div id="sb-queue-panel" class="sb-queue-panel hidden"></div>
      </div>
      
      <style>
        .spotify-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 90px;
          background: linear-gradient(180deg, #181818, #000);
          border-top: 1px solid #282828;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          z-index: 9999;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .sb-left {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 25%;
          min-width: 180px;
        }
        
        .sb-art {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1db954, #191414);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .sb-art:hover { transform: scale(1.05); }
        
        .sb-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .sb-info {
          overflow: hidden;
          flex: 1;
        }
        
        #sb-title {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        #sb-artist {
          font-size: 12px;
          color: #b3b3b3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .sb-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          max-width: 722px;
        }
        
        .sb-buttons {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .sb-btn {
          background: none;
          border: none;
          color: #b3b3b3;
          font-size: 16px;
          cursor: pointer;
          padding: 8px;
          transition: all 0.2s;
        }
        
        .sb-btn:hover {
          color: white;
          transform: scale(1.1);
        }

        .sb-btn.active {
          color: #1db954;
        }
        
        .sb-play-btn {
          width: 36px;
          height: 36px;
          background: white;
          color: black;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .sb-play-btn:hover {
          background: white;
          transform: scale(1.06);
        }
        
        .sb-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        
        .sb-progress span {
          font-size: 12px;
          color: #b3b3b3;
          width: 40px;
          text-align: center;
        }
        
        .sb-bar {
          flex: 1;
          height: 4px;
          background: #404040;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }
        
        .sb-bar:hover {
          height: 6px;
        }
        
        .sb-fill {
          height: 100%;
          background: #1db954;
          border-radius: 2px;
          width: 0%;
          transition: width 0.1s linear;
        }
        
        .sb-right {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 25%;
          justify-content: flex-end;
        }

        .sb-queue-panel {
          position: fixed;
          right: 16px;
          bottom: 100px;
          width: 320px;
          max-height: 50vh;
          overflow-y: auto;
          background: #111;
          border: 1px solid #282828;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          display: none;
          z-index: 10000;
        }

        .sb-queue-panel.visible {
          display: block;
        }

        .sb-queue-title {
          font-size: 13px;
          color: #b3b3b3;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sb-queue-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 4px;
          border-bottom: 1px solid #202020;
          font-size: 12px;
        }

        .sb-queue-item:last-child {
          border-bottom: none;
        }

        .sb-queue-item strong {
          color: #fff;
          font-weight: 500;
        }

        .sb-queue-item span {
          color: #b3b3b3;
        }
        
        .sb-volume {
          width: 100px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: #404040;
          border-radius: 2px;
          cursor: pointer;
        }
        
        .sb-volume::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .sb-volume::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .sb-right:hover .sb-volume::-webkit-slider-thumb {
          opacity: 1;
        }
        
        .sb-right:hover .sb-volume::-moz-range-thumb {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .spotify-bar {
            height: auto;
            flex-wrap: wrap;
            padding: 8px;
          }
          .sb-left { width: 100%; margin-bottom: 8px; }
          .sb-center { width: 100%; margin-bottom: 8px; }
          .sb-right { width: 100%; }
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    document.body.style.paddingBottom = '90px';
    this.attachListeners();
    this.initYT();
  }

  attachListeners() {
    document.getElementById('sb-play')?.addEventListener('click', () => this.togglePlay());
    document.getElementById('sb-next')?.addEventListener('click', () => this.next());
    document.getElementById('sb-prev')?.addEventListener('click', () => this.previous());
    document.getElementById('sb-shuffle')?.addEventListener('click', () => this.toggleShuffle());
    document.getElementById('sb-repeat')?.addEventListener('click', () => this.toggleRepeat());
    document.getElementById('sb-queue')?.addEventListener('click', () => this.toggleQueue());
    document.getElementById('sb-volume')?.addEventListener('input', (e) => {
      this.volume = parseInt(e.target.value);
      if (this.ytPlayer && this.ytPlayer.setVolume) this.ytPlayer.setVolume(this.volume);
    });
    document.getElementById('sb-bar')?.addEventListener('click', (e) => this.seek(e));
  }

  initYT() {
    // Wait for YouTube API to be ready
    if (!window.YT || !window.YT.Player) {
      console.log('⏳ Waiting for YouTube API...');
      setTimeout(() => this.initYT(), 200);
      return;
    }
    
    console.log('✅ YouTube API ready, creating player...');
    this.ytPlayer = new YT.Player('sb-yt', {
      height: '1',
      width: '1',
      playerVars: { 
        autoplay: 1, 
        controls: 0, 
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (e) => {
          console.log('✅ YouTube Player ready!');
          this.ytReady = true;
          e.target.setVolume(this.volume);
          // Play pending song if any
          if (this.pendingSong) {
            this.playCurrent();
            this.pendingSong = false;
          }
        },
        onStateChange: (e) => this.onYTState(e),
        onError: (e) => { 
          console.log('▶️ Video error:', e.data, '- skipping...'); 
          setTimeout(() => this.next(), 1000);
        }
      }
    });
  }

  onYTState(e) {
    if (e.data === YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.updatePlayBtn();
      this.updateProgress();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    } else if (e.data === YT.PlayerState.ENDED) {
      this.next();
    } else {
      this.isPlaying = false;
      this.updatePlayBtn();
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    }
  }

  playPlaylist(songs, index = 0) {
    if (!songs || !songs.length) {
      console.log('❌ No songs to play');
      return;
    }
    console.log('🎵 Playing playlist with', songs.length, 'songs');
    this.playlist = [...songs];
    this.currentIndex = index;

    if (this.shuffle) {
      this.shufflePlaylist();
    }

    if (this.onPlaylistChange) {
      this.onPlaylistChange(this.playlist);
    }
    this.playCurrent();
  }

  play(song) {
    if (!song) return;
    this.playPlaylist([song], 0);
  }

  playCurrent() {
    const song = this.playlist[this.currentIndex];
    if (!song) {
      console.log('❌ No song at index', this.currentIndex);
      return;
    }
    
    // If player not ready yet, mark as pending
    if (!this.ytPlayer || !this.ytReady) {
      console.log('⏳ Player not ready, queuing song...');
      this.pendingSong = true;
      // Update UI anyway
      document.getElementById('sb-title').textContent = song.title || 'Loading...';
      document.getElementById('sb-artist').textContent = (song.artist || 'Unknown') + ' • ' + (song.movie || song.language || 'Music');
      return;
    }
    
    console.log('▶️ Playing:', song.title, '| YouTube ID:', song.youtubeId);
    document.getElementById('sb-title').textContent = song.title;
    document.getElementById('sb-artist').textContent = (song.artist || 'Unknown') + ' • ' + (song.movie || song.language || 'Music');
    
    const art = document.getElementById('sb-art');
    if (song.youtubeId) {
      art.innerHTML = `<img src="https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg" alt="${song.title}">`;
    } else if (song.thumbnail) {
      art.innerHTML = `<img src="${song.thumbnail}" alt="${song.title}">`;
    } else {
      art.innerHTML = '<i class="fas fa-music"></i>';
    }
    
    if (song.youtubeId && this.ytPlayer.loadVideoById) {
      this.ytPlayer.loadVideoById(song.youtubeId);
      if (this.ytPlayer.setVolume) this.ytPlayer.setVolume(this.volume);
    } else {
      console.log('❌ No youtubeId for song or player not ready');
    }

    this.updateQueuePanel();
    if (this.onSongChange) this.onSongChange(song);
  }

  pause() {
    if (this.ytPlayer && this.ytPlayer.pauseVideo) {
      this.ytPlayer.pauseVideo();
    }
  }

  resume() {
    if (this.ytPlayer && this.ytPlayer.playVideo) {
      this.ytPlayer.playVideo();
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    const btn = document.getElementById('sb-shuffle');
    if (btn) btn.classList.toggle('active', this.shuffle);
    if (this.shuffle) {
      this.shufflePlaylist();
      this.updateQueuePanel();
    }
  }

  shuffle() {
    if (!this.shuffle) {
      this.shuffle = true;
      const btn = document.getElementById('sb-shuffle');
      if (btn) btn.classList.add('active');
    }
    this.shufflePlaylist();
    this.updateQueuePanel();
  }

  toggleRepeat() {
    this.repeat = !this.repeat;
    const btn = document.getElementById('sb-repeat');
    if (btn) btn.classList.toggle('active', this.repeat);
  }

  shufflePlaylist() {
    if (this.playlist.length <= 1) return;
    const current = this.playlist[this.currentIndex];
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
    this.currentIndex = this.playlist.findIndex((song) => song.id === current.id);
    if (this.currentIndex < 0) this.currentIndex = 0;
  }

  toggleQueue() {
    this.queueVisible = !this.queueVisible;
    const panel = document.getElementById('sb-queue-panel');
    if (!panel) return;
    panel.classList.toggle('visible', this.queueVisible);
    if (this.queueVisible) {
      this.updateQueuePanel();
    }
  }

  updateQueuePanel() {
    const panel = document.getElementById('sb-queue-panel');
    if (!panel || !this.queueVisible) return;

    const upcoming = this.playlist.slice(this.currentIndex + 1, this.currentIndex + 11);
    const items = upcoming.map((song, idx) => {
      const number = this.currentIndex + idx + 2;
      return `<div class="sb-queue-item"><strong>${number}. ${song.title}</strong><span>${song.artist || ''}</span></div>`;
    }).join('');

    panel.innerHTML = `
      <div class="sb-queue-title">Up Next</div>
      ${items || '<div class="sb-queue-item"><span>No upcoming tracks</span></div>'}
    `;
  }

  togglePlay() {
    if (!this.ytPlayer || !this.ytPlayer.pauseVideo) return;
    this.isPlaying ? this.ytPlayer.pauseVideo() : this.ytPlayer.playVideo();
  }

  next() {
    if (this.playlist.length === 0) return;
    if (this.currentIndex >= this.playlist.length - 1) {
      if (this.repeat) {
        this.currentIndex = 0;
      } else {
        this.isPlaying = false;
        this.updatePlayBtn();
        return;
      }
    } else {
      this.currentIndex += 1;
    }
    this.playCurrent();
  }

  previous() {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playCurrent();
  }

  seek(e) {
    if (!this.ytPlayer) return;
    const bar = document.getElementById('sb-bar');
    const percent = e.offsetX / bar.offsetWidth;
    const time = percent * this.ytPlayer.getDuration();
    this.ytPlayer.seekTo(time);
  }

  updateProgress() {
    if (!this.ytPlayer) return;
    const current = this.ytPlayer.getCurrentTime() || 0;
    const duration = this.ytPlayer.getDuration() || 0;
    const percent = duration ? (current / duration) * 100 : 0;
    
    document.getElementById('sb-fill').style.width = percent + '%';
    document.getElementById('sb-time').textContent = this.formatTime(current);
    document.getElementById('sb-duration').textContent = this.formatTime(duration);
    
    if (this.isPlaying) setTimeout(() => this.updateProgress(), 1000);
  }

  formatTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + Math.floor(s % 60).toString().padStart(2, '0');
  }

  updatePlayBtn() {
    const btn = document.getElementById('sb-play');
    if (btn) btn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.spotifyPlayer = new SpotifyPlayer();
  window.musicPlayer = window.spotifyPlayer;
  console.log('🎵 Spotify-Style Player (YouTube) Ready!');
});

// Fallback for older code
window.SpotifyPlayer = SpotifyPlayer;
