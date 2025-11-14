document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Music Tab Functionality
    const artistList = document.getElementById('artistList');
    const artistSearch = document.getElementById('artistSearch');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nextRandomBtn = document.getElementById('nextRandomBtn');
    const nowPlayingAudio = document.getElementById('nowPlayingAudio');
    const musicBgOverlay = document.getElementById('musicBgOverlay');
    const rotatingSpot = musicBgOverlay.querySelector('.rotating-spot');

    // Sort artists alphabetically
    if (artistList) {
        const artists = Array.from(artistList.querySelectorAll('.artist'));
        artists.sort((a, b) => {
            const nameA = a.querySelector('.artist-header').textContent.trim().toLowerCase();
            const nameB = b.querySelector('.artist-header').textContent.trim().toLowerCase();
            return nameA.localeCompare(nameB);
        });
        artists.forEach(artist => artistList.appendChild(artist));
    }

    // Artist search
    if (artistSearch) {
        artistSearch.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            const artists = artistList.querySelectorAll('.artist');
            artists.forEach(artist => {
                const name = artist.querySelector('.artist-header').textContent.trim().toLowerCase();
                artist.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }

    // Get all songs
    function getAllSongs() {
        const songs = [];
        artistList.querySelectorAll('.song-info').forEach(info => {
            const title = info.querySelector('h4') ? info.querySelector('h4').textContent.trim() : '';
            const artist = info.querySelector('p') ? info.querySelector('p').textContent.trim() : '';
            const audio = info.querySelector('audio');
            let src = '';
            if (audio) {
                const mp3 = audio.querySelector('source[type="audio/mpeg"]');
                const ogg = audio.querySelector('source[type="audio/ogg"]');
                if (mp3) src = mp3.getAttribute('src');
                else if (ogg) src = ogg.getAttribute('src');
            }
            if (title && artist && src) {
                songs.push({ title, artist, src, audioElem: audio });
            }
        });
        return songs;
    }

    let allSongs = getAllSongs();
    let currentSongIndex = -1;

    // Pause all artist audio elements
    function pauseAllArtistAudio() {
        allSongs.forEach(song => {
            if (!song.audioElem.paused) {
                song.audioElem.pause();
                song.audioElem.currentTime = 0;
            }
        });
    }

    // Play a song by index
    function playSong(index) {
        allSongs = getAllSongs();
        if (!allSongs.length) return;
        if (index < 0 || index >= allSongs.length) index = 0;
        currentSongIndex = index;
        const song = allSongs[index];

        // Update Now Playing UI
        nowPlayingTitle.innerHTML = `<span style="color:#d81b60;">${song.title}</span> <span style="color:#888;">by</span> <span style="color:#d81b60;">${song.artist}</span>`;

        // Set audio src and play
        nowPlayingAudio.src = song.src;
        nowPlayingAudio.currentTime = 0;
        nowPlayingAudio.play();

        // Pause all artist audio elements and sync their state
        pauseAllArtistAudio();
    }

    // Play a random song, not repeating the current one
    function playRandomSong() {
        allSongs = getAllSongs();
        if (!allSongs.length) return;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * allSongs.length);
        } while (allSongs.length > 1 && randomIndex === currentSongIndex);
        playSong(randomIndex);
    }

    // Listen for play events on all artist audio elements
    function attachAudioListeners() {
        allSongs = getAllSongs();
        allSongs.forEach((song, idx) => {
            song.audioElem.controls = false;
            let playBtn = song.audioElem.parentNode.querySelector('.custom-play-btn');
            if (!playBtn) {
                playBtn = document.createElement('button');
                playBtn.className = 'custom-play-btn';
                playBtn.textContent = '▶️';
                playBtn.style.marginLeft = '10px';
                playBtn.style.background = '#fff';
                playBtn.style.border = '1px solid #d81b60';
                playBtn.style.color = '#d81b60';
                playBtn.style.borderRadius = '50%';
                playBtn.style.width = '32px';
                playBtn.style.height = '32px';
                playBtn.style.cursor = 'pointer';
                playBtn.style.fontSize = '18px';
                playBtn.style.transition = 'background 0.2s';
                playBtn.onmouseenter = () => playBtn.style.background = '#ffe4ef';
                playBtn.onmouseleave = () => playBtn.style.background = '#fff';
                song.audioElem.parentNode.appendChild(playBtn);
                playBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    playSong(idx);
                });
            }
        });
    }
    attachAudioListeners();

    // Now Playing audio events
    nowPlayingAudio.addEventListener('play', function() {
        pauseAllArtistAudio();
        setMusicBg(true);
    });
    nowPlayingAudio.addEventListener('pause', function() {
        setMusicBg(false);
    });
    nowPlayingAudio.addEventListener('ended', function() {
        setMusicBg(false);
        playRandomSong();
    });

    // Next Random button event
    if (nextRandomBtn) {
        nextRandomBtn.addEventListener('click', playRandomSong);
    }

    // Initial state
    nowPlayingTitle.textContent = 'None';

    // Helper to toggle overlay
    function setMusicBg(active) {
        if (!musicBgOverlay) return;
        if (active) {
            musicBgOverlay.classList.add('active');
            rotatingSpot.style.animationPlayState = 'running';
        } else {
            musicBgOverlay.classList.remove('active');
            rotatingSpot.style.animationPlayState = 'paused';
        }
    }
});