(function () {
  'use strict';

  var dialog = document.getElementById('content-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var titleEl = dialog.querySelector('#content-dialog-title');
  var bodyEl = dialog.querySelector('[data-dialog-body]');
  var closeBtn = dialog.querySelector('[data-dialog-close]');

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function waveformBarsHtml() {
    var html = '';
    for (var i = 1; i <= 40; i++) {
      var h = ((i * 17 + ((i % 5) * 23)) % 55) + 28;
      html += '<span class="audio-bar__bar" style="--bar-h: ' + h + '%"></span>';
    }
    return html;
  }

  function initAudioBar(bar) {
    var media = bar.querySelector('.audio-bar__media');
    var playBtn = bar.querySelector('.audio-bar__play');
    var waveBtn = bar.querySelector('.audio-bar__waveform');
    var currentEl = bar.querySelector('.audio-bar__current');
    var durationEl = bar.querySelector('.audio-bar__duration');
    var items = bar.querySelectorAll('.audio-bar__bar');

    if (!media || !playBtn) return;

    function updateBars(progress) {
      var played = Math.round(progress * items.length);
      items.forEach(function (item, i) {
        item.classList.toggle('is-played', i < played);
      });
    }

    function setPlayState(playing) {
      bar.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }

    function syncUI() {
      var dur = media.duration || 0;
      var cur = media.currentTime || 0;
      if (currentEl) currentEl.textContent = formatTime(cur);
      if (durationEl) durationEl.textContent = formatTime(dur);
      updateBars(dur ? cur / dur : 0);
    }

    function togglePlay() {
      if (media.paused) {
        document.querySelectorAll('[data-audio-bar] .audio-bar__media').forEach(function (other) {
          if (other !== media && !other.paused) other.pause();
        });
        media.play();
        setPlayState(true);
      } else {
        media.pause();
        setPlayState(false);
      }
    }

    playBtn.addEventListener('click', togglePlay);

    if (waveBtn) {
      waveBtn.addEventListener('click', function (e) {
        if (!media.duration) return;
        var rect = waveBtn.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        media.currentTime = ratio * media.duration;
        syncUI();
      });
    }

    media.addEventListener('loadedmetadata', syncUI);
    media.addEventListener('timeupdate', syncUI);
    media.addEventListener('ended', function () {
      setPlayState(false);
      syncUI();
    });

    setPlayState(false);
    syncUI();
  }

  function stopMedia() {
    bodyEl.querySelectorAll('audio, video').forEach(function (el) {
      el.pause();
    });
  }

  function closeDialog() {
    stopMedia();
    bodyEl.innerHTML = '';
    dialog.classList.remove('content-dialog--video');
    document.documentElement.classList.remove('content-dialog-open');
    dialog.close();
  }

  function buildBody(tipo, btn) {
    var titulo = (btn.getAttribute('data-dialog-titulo') || '').trim() || 'Contenido';

    if (tipo === 'audio') {
      var src = btn.getAttribute('data-dialog-src');
      if (!src) return '';
      return (
        '<div class="section-audios-wrap">' +
        '<div class="audio-bar" data-audio-bar>' +
        '<audio class="audio-bar__media" src="' + src + '" preload="metadata"></audio>' +
        '<button type="button" class="audio-bar__play" aria-label="Reproducir ' + titulo + '" aria-pressed="false">' +
        '<span class="audio-bar__play-face" aria-hidden="true">' +
        '<span class="audio-bar__play-icon audio-bar__play-icon--play"></span>' +
        '<span class="audio-bar__play-icon audio-bar__play-icon--pause"></span>' +
        '</span></button>' +
        '<span class="audio-bar__title">' + titulo + '</span>' +
        '<button type="button" class="audio-bar__waveform" aria-label="Buscar posición en ' + titulo + '">' +
        '<span class="audio-bar__waveform-bars" aria-hidden="true">' + waveformBarsHtml() + '</span></button>' +
        '<span class="audio-bar__time" aria-live="polite" aria-atomic="true">' +
        '<span class="audio-bar__current">0:00</span><span class="audio-bar__sep"> / </span>' +
        '<span class="audio-bar__duration">0:00</span></span></div></div>'
      );
    }

    if (tipo === 'video') {
      var src = btn.getAttribute('data-dialog-src');
      var poster = btn.getAttribute('data-dialog-poster') || '';
      var url = btn.getAttribute('data-dialog-url');
      if (src) {
        var posterAttr = poster ? ' poster="' + poster + '"' : '';
        return (
          '<div class="video-block video-block--native"><div class="video-block__player">' +
          '<video controls controlslist="nodownload" playsinline preload="metadata"' + posterAttr +
          ' title="' + titulo + '">' +
          '<source src="' + src + '" type="video/mp4">' +
          'Tu navegador no reproduce este video.</video></div></div>'
        );
      }
      if (url) {
        return (
          '<div class="video-block"><div class="video-block__embed">' +
          '<iframe src="' + url + '" title="' + titulo + '" loading="lazy" ' +
          'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div>'
        );
      }
      return (
        '<div class="video-block"><div class="video-block__placeholder" aria-hidden="true">' +
        '<p class="video-block__titulo">' + titulo + '</p></div></div>'
      );
    }

    if (tipo === 'html') {
      var sourceId = btn.getAttribute('data-dialog-source');
      var source = sourceId ? document.getElementById(sourceId) : null;
      return source ? source.innerHTML : '';
    }

    var texto = btn.getAttribute('data-dialog-texto') || '';
    return '<p>' + texto.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>';
  }

  var ignoreBackdrop = false;

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-dialog-open]');
    if (!btn) return;

    var titulo = (btn.getAttribute('data-dialog-titulo') || '').trim();
    var tipo = btn.getAttribute('data-dialog-tipo') || 'texto';

    titleEl.textContent = titulo;
    titleEl.hidden = !titulo;
    if (titulo) {
      dialog.setAttribute('aria-labelledby', 'content-dialog-title');
      dialog.removeAttribute('aria-label');
    } else {
      dialog.removeAttribute('aria-labelledby');
      dialog.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Contenido');
    }
    dialog.classList.toggle('content-dialog--video', tipo === 'video');
    bodyEl.innerHTML = buildBody(tipo, btn);

    bodyEl.querySelectorAll('[data-audio-bar]').forEach(initAudioBar);
    ignoreBackdrop = true;
    document.documentElement.classList.add('content-dialog-open');
    dialog.showModal();
    setTimeout(function () { ignoreBackdrop = false; }, 300);
  });

  closeBtn.addEventListener('click', closeDialog);

  dialog.addEventListener('click', function (event) {
    if (ignoreBackdrop) return;
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeDialog();
  });
})();
