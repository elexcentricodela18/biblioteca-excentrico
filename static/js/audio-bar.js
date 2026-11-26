(function () {
    'use strict';

    var bars = document.querySelectorAll('[data-audio-bar]');
    if (!bars.length) return;

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    function updateBars(bar, progress) {
        var items = bar.querySelectorAll('.audio-bar__bar');
        var played = Math.round(progress * items.length);
        items.forEach(function (item, i) {
            item.classList.toggle('is-played', i < played);
        });
    }

    function setPlayState(bar, playing) {
        var playBtn = bar.querySelector('.audio-bar__play');
        var title = bar.querySelector('.audio-bar__title');
        if (!playBtn) return;

        bar.classList.toggle('is-playing', playing);
        playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');

        var name = title ? title.textContent.trim() : 'audio';
        playBtn.setAttribute(
            'aria-label',
            playing ? 'Pausar ' + name : 'Reproducir ' + name
        );
    }

    function updateSliderA11y(bar, media) {
        var waveBtn = bar.querySelector('.audio-bar__waveform');
        if (!waveBtn) return;

        var dur = media.duration || 0;
        var cur = media.currentTime || 0;
        var pct = dur ? Math.round((cur / dur) * 100) : 0;
        waveBtn.setAttribute('aria-valuenow', String(pct));
        waveBtn.setAttribute(
            'aria-valuetext',
            formatTime(cur) + ' de ' + formatTime(dur)
        );
    }

    function pauseOthers(current) {
        bars.forEach(function (bar) {
            if (bar === current) return;
            var media = bar.querySelector('.audio-bar__media');
            if (media && !media.paused) {
                media.pause();
                setPlayState(bar, false);
            }
        });
    }

    bars.forEach(function (bar) {
        var media = bar.querySelector('.audio-bar__media');
        var playBtn = bar.querySelector('.audio-bar__play');
        var waveBtn = bar.querySelector('.audio-bar__waveform');
        var currentEl = bar.querySelector('.audio-bar__current');
        var durationEl = bar.querySelector('.audio-bar__duration');

        if (!media || !playBtn) return;

        function syncUI(updateSlider) {
            var dur = media.duration || 0;
            var cur = media.currentTime || 0;
            currentEl.textContent = formatTime(cur);
            durationEl.textContent = formatTime(dur);
            updateBars(bar, dur ? cur / dur : 0);
            if (updateSlider) {
                updateSliderA11y(bar, media);
            }
        }

        function togglePlay() {
            if (media.paused) {
                pauseOthers(bar);
                media.play();
                setPlayState(bar, true);
            } else {
                media.pause();
                setPlayState(bar, false);
            }
        }

        function seekByRatio(ratio) {
            if (!media.duration) return;
            media.currentTime = ratio * media.duration;
            syncUI(true);
        }

        playBtn.addEventListener('click', togglePlay);

        playBtn.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                togglePlay();
            }
        });

        if (waveBtn) {
            waveBtn.addEventListener('click', function (e) {
                var rect = waveBtn.getBoundingClientRect();
                var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                seekByRatio(ratio);
            });

            waveBtn.addEventListener('keydown', function (e) {
                if (!media.duration) return;
                var step = 5;
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    media.currentTime = Math.min(media.duration, media.currentTime + step);
                    syncUI(true);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    media.currentTime = Math.max(0, media.currentTime - step);
                    syncUI(true);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    media.currentTime = 0;
                    syncUI(true);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    media.currentTime = media.duration;
                    syncUI(true);
                }
            });
        }

        media.addEventListener('loadedmetadata', function () { syncUI(true); });
        media.addEventListener('timeupdate', function () { syncUI(false); });
        media.addEventListener('ended', function () {
            setPlayState(bar, false);
            syncUI(true);
        });

        setPlayState(bar, false);
        syncUI(true);
    });
})();
