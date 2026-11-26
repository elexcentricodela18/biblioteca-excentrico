/**
 * hero-luces.js — Focos de color en héroes de sección
 *
 * Degradé radial del color de la sección, encima de la foto
 * (sin mix-blend). Aparecen y desaparecen en posiciones al azar.
 * Solo el recorte del hero.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var DURACION_MIN = 4000;
  var DURACION_MAX = 6000;
  var TRANSICION_MS = 2000;
  var DELAY_2DA_MIN = 300;
  var DELAY_2DA_MAX = 1000;
  var INTERVALO_MIN = 3500;
  var INTERVALO_MAX = 5000;
  var POSICIONES = ['0% 0%', '50% 0%', '100% 0%', '0% 50%', '100% 50%', '50% 100%'];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function colorDe(media) {
    var rgb = getComputedStyle(media).getPropertyValue('--hero-luz-rgb').trim();
    if (!rgb) {
      var token = '--color-historia-rgb';
      if (media.closest('.alberto-ure-page')) token = '--color-alberto-ure-rgb';
      else if (media.closest('.valentina-page')) token = '--color-valentina-rgb';
      else if (media.closest('.section-page--equipo')) token = '--color-equipo-rgb';
      rgb = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    }
    return 'rgba(' + (rgb || '255, 77, 77') + ', 0.55)';
  }

  function crearLuz(media, ultimaPos) {
    var luz = document.createElement('div');
    luz.className = 'hero-luz';
    luz.setAttribute('aria-hidden', 'true');

    var pos = POSICIONES[Math.floor(Math.random() * POSICIONES.length)];
    if (ultimaPos && POSICIONES.length > 1) {
      var guard = 0;
      while (pos === ultimaPos && guard < 6) {
        pos = POSICIONES[Math.floor(Math.random() * POSICIONES.length)];
        guard += 1;
      }
    }

    luz.style.background =
      'radial-gradient(circle at ' + pos + ', ' + colorDe(media) + ', transparent 65%)';
    media.appendChild(luz);
    return { luz: luz, pos: pos };
  }

  function mostrarLuz(state) {
    if (state.paused) return;
    var creado = crearLuz(state.media, state.ultimaPos);
    state.ultimaPos = creado.pos;
    var luz = creado.luz;

    requestAnimationFrame(function () {
      setTimeout(function () {
        luz.classList.add('is-visible');
      }, 50);
    });

    var permanencia = rand(DURACION_MIN, DURACION_MAX);
    setTimeout(function () {
      luz.classList.remove('is-visible');
      setTimeout(function () {
        luz.remove();
      }, TRANSICION_MS + 100);
    }, permanencia);
  }

  function ciclo(state) {
    if (state.paused) return;
    mostrarLuz(state);
    state.timers.push(setTimeout(function () {
      mostrarLuz(state);
    }, rand(DELAY_2DA_MIN, DELAY_2DA_MAX)));
    state.timers.push(setTimeout(function () {
      ciclo(state);
    }, rand(INTERVALO_MIN, INTERVALO_MAX)));
  }

  function limpiarTimers(state) {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function arrancar(state) {
    if (!state.paused) return;
    state.paused = false;
    ciclo(state);
  }

  function pausar(state) {
    if (state.paused) return;
    state.paused = true;
    limpiarTimers(state);
  }

  function enVista(el) {
    var r = el.getBoundingClientRect();
    return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  }

  function initMedia(media) {
    var state = {
      media: media,
      paused: true,
      timers: [],
      ultimaPos: null
    };

    var visible = enVista(media);
    var paginaVisible = document.visibilityState !== 'hidden';

    function sync() {
      if (visible && paginaVisible) arrancar(state);
      else pausar(state);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        visible = !!(entries[0] && entries[0].isIntersecting);
        sync();
      }, { threshold: 0, rootMargin: '0px' });
      io.observe(media);
    }

    sync();

    document.addEventListener('visibilitychange', function () {
      paginaVisible = document.visibilityState !== 'hidden';
      sync();
    });
  }

  document.querySelectorAll('[data-hero-luces]').forEach(initMedia);
})();
