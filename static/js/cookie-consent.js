(function () {
  'use strict';

  var STORAGE_KEY = 'excentrico-cookie-consent';
  var banner = document.getElementById('cookie-consent');

  if (!banner) return;

  function getChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function loadAnalytics() {
    /* Activar Vercel Web Analytics u otra herramienta solo tras aceptar. */
  }

  function applyChoice(choice) {
    setChoice(choice);
    hideBanner();

    if (choice === 'accepted') {
      loadAnalytics();
    }
  }

  var existing = getChoice();
  if (existing === 'accepted') {
    loadAnalytics();
    return;
  }

  if (existing === 'declined') {
    return;
  }

  banner.hidden = false;

  banner.querySelector('[data-cookie-accept]')?.addEventListener('click', function () {
    applyChoice('accepted');
  });

  banner.querySelector('[data-cookie-decline]')?.addEventListener('click', function () {
    applyChoice('declined');
  });
})();
