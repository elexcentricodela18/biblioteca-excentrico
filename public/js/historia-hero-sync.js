(function () {
    var hero = document.querySelector('[data-historia-hero]');
    if (!hero) return;

    var audio = hero.querySelector('.historia-hero__audio');
    var img = hero.querySelector('.historia-hero-img');
    var headline = hero.querySelector('.historia-hero-headline');
    var epigrafe = hero.querySelector('.historia-hero-epigrafe');
    var epigrafeWrap = hero.querySelector('.historia-epigrafe-wrap');
    var toggle = hero.querySelector('.historia-hero-toggle');

    var syncPoints = [];
    try {
        syncPoints = JSON.parse(hero.getAttribute('data-sync-points') || '[]');
    } catch (e) {
        return;
    }

    if (!audio || !syncPoints.length) return;

    syncPoints.sort(function (a, b) { return a.time - b.time; });

    var currentIndex = -1;
    var transitioning = false;
    var pendingIndex = null;

    function pointHeadline(point) {
        return point.headline || point.text || '';
    }

    function pointIndex(time) {
        var idx = 0;
        for (var i = 0; i < syncPoints.length; i++) {
            if (time >= syncPoints[i].time) idx = i;
            else break;
        }
        return idx;
    }

    function fadeDurationMs(el) {
        if (!el) return 450;
        var raw = getComputedStyle(el).transitionDuration || '0.45s';
        var parts = raw.split(',').map(function (part) { return part.trim(); });
        var maxSeconds = 0;
        for (var i = 0; i < parts.length; i++) {
            var value = parseFloat(parts[i]);
            if (isNaN(value)) continue;
            if (parts[i].indexOf('ms') !== -1) {
                maxSeconds = Math.max(maxSeconds, value / 1000);
            } else {
                maxSeconds = Math.max(maxSeconds, value);
            }
        }
        return Math.max(maxSeconds * 1000, 0);
    }

    function setEpigrafe(text) {
        if (!epigrafeWrap || !epigrafe) return;
        if (text) {
            epigrafe.textContent = text;
            epigrafeWrap.hidden = false;
        } else {
            epigrafe.textContent = '';
            epigrafeWrap.hidden = true;
        }
    }

    function waitForNextFrame() {
        return new Promise(function (resolve) {
            requestAnimationFrame(function () {
                requestAnimationFrame(resolve);
            });
        });
    }

    function fadeElement(el, visible) {
        return new Promise(function (resolve) {
            if (!el) {
                resolve();
                return;
            }

            var durationMs = fadeDurationMs(el);
            var done = false;
            var fallbackTimer = window.setTimeout(finish, durationMs + 80);

            function finish() {
                if (done) return;
                done = true;
                window.clearTimeout(fallbackTimer);
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }

            function onEnd(e) {
                if (e.target !== el || e.propertyName !== 'opacity') return;
                finish();
            }

            el.addEventListener('transitionend', onEnd);
            void el.offsetWidth;
            el.classList.toggle('is-faded', !visible);
        });
    }

    function preloadImage(src) {
        return new Promise(function (resolve) {
            if (!src) {
                resolve();
                return;
            }
            var preloader = new Image();
            preloader.onload = preloader.onerror = function () { resolve(); };
            preloader.src = src;
        });
    }

    function updateContent(point) {
        if (img && point.src) img.src = point.src;
        if (headline) headline.textContent = pointHeadline(point);
        setEpigrafe(point.epigrafe || '');
    }

    function applyPoint(index, options) {
        options = options || {};

        if (index === currentIndex) return;

        if (transitioning) {
            pendingIndex = index;
            return;
        }

        if (options.immediate || currentIndex === -1) {
            currentIndex = index;
            updateContent(syncPoints[index]);
            if (img) img.classList.remove('is-faded');
            if (headline) headline.classList.remove('is-faded');
            return;
        }

        transitioning = true;
        var point = syncPoints[index];
        var nextSrc = point.src || (img ? img.src : '');

        Promise.all([
            fadeElement(img, false),
            fadeElement(headline, false),
            preloadImage(nextSrc)
        ]).then(function () {
            updateContent(point);
            currentIndex = index;
            return waitForNextFrame();
        }).then(function () {
            return Promise.all([
                fadeElement(img, true),
                fadeElement(headline, true)
            ]);
        }).then(function () {
            transitioning = false;
            if (pendingIndex !== null && pendingIndex !== currentIndex) {
                var next = pendingIndex;
                pendingIndex = null;
                applyPoint(next);
            } else {
                pendingIndex = null;
            }
        });
    }

    function syncToAudio() {
        applyPoint(pointIndex(audio.currentTime));
    }

    function setPlaying(playing) {
        hero.classList.toggle('is-playing', playing);
        hero.classList.toggle('is-paused', !playing);
        hero.classList.toggle('needs-user-gesture', !playing && audio.paused);

        if (!toggle) return;

        toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
        toggle.setAttribute('aria-label', playing ? 'Pausar relato' : 'Reproducir relato');
    }

    function playRelato() {
        return audio.play().then(function () {
            setPlaying(true);
        }).catch(function () {
            setPlaying(false);
        });
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            if (audio.paused) {
                playRelato();
            } else {
                audio.pause();
                setPlaying(false);
            }
        });
    }

    audio.addEventListener('timeupdate', syncToAudio);
    audio.addEventListener('seeked', syncToAudio);
    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });

    applyPoint(0, { immediate: true });
    playRelato();
})();
