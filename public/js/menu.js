/**
 * menu.js — Navegación global
 * El excéntrico de la 18
 * 
 * Incluir en todas las páginas:
 *   <script src="/js/menu.js" defer></script>
 * 
 * Agregar clase al body según contexto:
 *   <body class="home">          → hamburguesa blanca (landing oscuro)
 *   <body class="pagina-blanca"> → hamburguesa negra (páginas internas)
 */

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('menu');
  const overlay   = document.getElementById('overlay');

  if (!hamburger || !menu) return;

  function cerrarMenu() {
    menu.classList.remove('abierto');
    hamburger.classList.remove('abierto');
    if (overlay) overlay.classList.remove('activo');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    menu.classList.add('abierto');
    hamburger.classList.add('abierto');
    if (overlay) overlay.classList.add('activo');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  hamburger.addEventListener('click', () => {
    menu.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
  });

  if (overlay) overlay.addEventListener('click', cerrarMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarMenu();
  });

  /* Páginas interiores @ ≤1279px: centrado en header arriba; fijo al scroll */
  function updateHamburgerPin() {
    if (!document.body.classList.contains('pagina-blanca')) return;
    if (window.matchMedia('(min-width: 1280px)').matches) return;

    hamburger.classList.toggle('is-pinned', window.scrollY > 0);
  }

  window.addEventListener('scroll', updateHamburgerPin, { passive: true });
  window.addEventListener('resize', updateHamburgerPin);
  updateHamburgerPin();
});
