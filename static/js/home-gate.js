(function () {
  'use strict';

  var STORAGE_KEY = 'excentrico-home-access';
  var PASSWORD = 'EE18';

  var gate = document.getElementById('home-gate');
  var form = document.getElementById('home-gate-form');
  var input = document.getElementById('home-gate-password');
  var error = document.getElementById('home-gate-error');

  if (!gate || !form || !input) return;

  function isUnlocked() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'granted';
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted');
    } catch (e) {
      /* ignore */
    }

    document.documentElement.classList.add('home-unlocked');
    gate.hidden = true;
  }

  if (isUnlocked()) {
    document.documentElement.classList.add('home-unlocked');
    gate.hidden = true;
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (input.value.trim() === PASSWORD) {
      unlock();
      return;
    }

    if (error) {
      error.hidden = false;
    }

    input.value = '';
    input.focus();
  });

  input.addEventListener('input', function () {
    if (error) {
      error.hidden = true;
    }
  });

  input.focus();
})();
