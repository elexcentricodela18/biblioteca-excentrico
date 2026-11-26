/**
 * escenario.js — Lógica del escenario teatral
 * El excéntrico de la 18
 * 
 * Solo incluir en index.html:
 *   <script src="/js/escenario.js" defer></script>
 */

const IMAGENES = [
  '/img/escenario/1986-01.jpg',  '/img/escenario/1986-02.jpg',  '/img/escenario/1989-01.jpg',  '/img/escenario/1989-02.jpg',
  '/img/escenario/1989-03.jpg',  '/img/escenario/1992-01.jpg',  '/img/escenario/1992-02.jpg',  '/img/escenario/1993-01.jpg',
  '/img/escenario/1993-02.jpg',  '/img/escenario/1993-03.jpg',  '/img/escenario/1997-01.jpg',  '/img/escenario/1998-01.jpg',  '/img/escenario/1998-02.jpg',  '/img/escenario/1999-01.jpg',
  '/img/escenario/1999-02.jpg',  '/img/escenario/2000-01.jpg',  '/img/escenario/2000-02.jpg',  '/img/escenario/2003-01.jpg',
  '/img/escenario/2006-01.jpg',  '/img/escenario/2006-02.png',
  '/img/escenario/2008-01.jpg',  '/img/escenario/2008-02.png',  '/img/escenario/2008-03.jpg',
  '/img/escenario/2014-01.jpg',  '/img/escenario/2015-01.jpg',  '/img/escenario/2015-02.jpg',
  '/img/escenario/2016-01.jpg',  '/img/escenario/2016-02.jpg',  '/img/escenario/2016-03.jpg',  '/img/escenario/2016-04.jpg',
  '/img/escenario/2016-05.jpg',  '/img/escenario/2021-01.jpg',  '/img/escenario/2026-01.jpg',  '/img/escenario/2026-02.jpg',
  '/img/escenario/2026-03.jpg',  '/img/escenario/sf-01.jpg',  '/img/escenario/sf-02.jpg',
  '/img/escenario/luz-01.png', '/img/escenario/luz-02.png', '/img/escenario/luz-03.png', '/img/escenario/luz-04.png',
  '/img/escenario/luz-05.png', '/img/escenario/luz-06.png', '/img/escenario/luz-07.png'
];

/* ── Colores de foco ── */
const COLORES = [
  'rgba(255, 77, 77, 1)', /* rojo */
  'rgba(255, 155, 84, 1)', /* naranja */
  'rgba(255, 192, 77, 1)', /* amarillo */
  'rgba(85, 224, 85, 1)', /* verde */
  'rgba(85, 205, 252, 1)', /* celeste */
  'rgba(85, 85, 255, 1)', /* azul */
  'rgba(181, 85, 255, 1)' /* violeta */
];

/* ── Parámetros ajustables ── */
const DURACION_MIN  = 4000;
const DURACION_MAX  = 6000;
const TRANSICION_MS = 1500;
const DESFASE_MAX   = 250;
const ROT_MIN       = 1;
const ROT_MAX       = 4;
const DELAY_2DA_MIN = 300;
const DELAY_2DA_MAX = 1000;
const INTERVALO_MIN = 3500;
const INTERVALO_MAX = 5000;

let zActual       = 1;
let ultimaRotacion = 0;
let mazo          = [];
let ultimaImagen  = null;

const rand = (min, max) => min + Math.random() * (max - min);

function barajar(lista) {
  const arr = lista.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function rellenarMazo() {
  mazo = barajar(IMAGENES);
  /* Evitar que la primera del nuevo ciclo sea la última del anterior */
  if (ultimaImagen && mazo.length > 1 && mazo[0] === ultimaImagen) {
    const swap = 1 + Math.floor(Math.random() * (mazo.length - 1));
    const tmp = mazo[0];
    mazo[0] = mazo[swap];
    mazo[swap] = tmp;
  }
}

function siguienteImagen() {
  if (mazo.length === 0) {
    rellenarMazo();
  }
  const img = mazo.shift();
  ultimaImagen = img;
  return img;
}

function crearSlide(src) {
  const escenario = document.getElementById('escenario');
  if (!escenario) return null;

  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.style.zIndex = zActual++;
  slide.style.transition = `opacity ${TRANSICION_MS}ms ease`;

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';

  /* ── Foco de color ── */
  const color = COLORES[Math.floor(Math.random() * COLORES.length)];
  const posiciones = ['0% 0%', '50% 0%', '100% 0%', '0% 50%', '100% 50%', '50% 100%'];
  const pos = posiciones[Math.floor(Math.random() * posiciones.length)];
  const luzPorDelante = Math.random() > 0.1;
  slide.style.setProperty('--z-foco', luzPorDelante ? '2' : '0');
  slide.style.setProperty('--gradiente-foco',
    /* ── Controlo la opacidad con este parámetro ── */
    `radial-gradient(circle at ${pos}, ${color}, transparent 50%)`);

  /* ── Rotación ── */
  const grados = rand(ROT_MIN, ROT_MAX);
  ultimaRotacion = (ultimaRotacion >= 0 ? -1 : 1) * grados;

  /* ── Desfase ── */
  const dist  = rand(0, DESFASE_MAX);
  const angle = Math.random() * Math.PI * 2;
  const dx    = Math.cos(angle) * dist;
  const dy    = Math.sin(angle) * dist;

  img.style.transform = `rotate(${ultimaRotacion}deg) translate(${dx}px, ${dy}px)`;

  slide.appendChild(img);
  escenario.appendChild(slide);
  return slide;
}

function mostrarSlide(src) {
  const slide = crearSlide(src);
  if (!slide) return;

  requestAnimationFrame(() => {
    setTimeout(() => slide.classList.add('visible'), 50);
  });

  const permanencia = rand(DURACION_MIN, DURACION_MAX);
  setTimeout(() => {
    slide.classList.remove('visible');
    setTimeout(() => slide.remove(), TRANSICION_MS + 100);
  }, permanencia);
}

function ciclo() {
  // Primera imagen
  mostrarSlide(siguienteImagen());

  // Segunda imagen con delay aleatorio
  setTimeout(() => {
    mostrarSlide(siguienteImagen());
  }, rand(DELAY_2DA_MIN, DELAY_2DA_MAX));

  // Próximo par
  setTimeout(ciclo, rand(INTERVALO_MIN, INTERVALO_MAX));
}

function iniciarEscenario() {
  ciclo();
  setTimeout(() => {
    const t = document.getElementById('titulo');
    const a = document.getElementById('anio');
    const c = document.getElementById('home-creditos');
    if (t) t.classList.add('visible');
    if (a) a.classList.add('visible');
    if (c) c.classList.add('visible');
  }, 800);
}

/* El mazo no corre detrás del candado. */
function esperarDesbloqueo() {
  if (document.documentElement.classList.contains('home-unlocked')) {
    iniciarEscenario();
    return;
  }
  const obs = new MutationObserver(() => {
    if (document.documentElement.classList.contains('home-unlocked')) {
      obs.disconnect();
      iniciarEscenario();
    }
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

document.addEventListener('DOMContentLoaded', esperarDesbloqueo);
