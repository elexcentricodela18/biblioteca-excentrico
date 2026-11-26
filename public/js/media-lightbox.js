(function () {
  'use strict';

  var dialog = document.getElementById('media-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var imgEl = dialog.querySelector('[data-lightbox-img]');
  var captionEl = dialog.querySelector('[data-lightbox-caption]');
  var closeBtn = dialog.querySelector('[data-lightbox-close]');
  var prevBtn = dialog.querySelector('[data-lightbox-prev]');
  var nextBtn = dialog.querySelector('[data-lightbox-next]');
  var items = [];
  var index = 0;

  function show() {
    var item = items[index];
    if (!item || !imgEl) return;
    var src = item.getAttribute('data-lightbox-src');
    var alt = item.getAttribute('aria-label') || '';
    alt = alt.replace(/^Ampliar\s+/i, '');
    imgEl.src = src;
    imgEl.alt = alt;
    var caption = item.getAttribute('data-lightbox-caption') || '';
    if (captionEl) {
      captionEl.textContent = caption;
      captionEl.hidden = !caption;
    }
    var many = items.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
  }

  function openFrom(btn) {
    var group = btn.closest('.media-gallery, .libro-grid');
    if (group) {
      items = Array.prototype.slice.call(group.querySelectorAll('[data-lightbox-open]'));
      index = items.indexOf(btn);
      if (index < 0) index = 0;
    } else {
      items = [btn];
      index = 0;
    }
    show();
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('lightbox-open');
  }

  function closeLightbox() {
    document.documentElement.classList.remove('lightbox-open');
    dialog.close();
    imgEl.removeAttribute('src');
    imgEl.alt = '';
    if (captionEl) {
      captionEl.textContent = '';
      captionEl.hidden = true;
    }
    items = [];
  }

  function step(delta) {
    if (items.length < 2) return;
    index = (index + delta + items.length) % items.length;
    show();
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-lightbox-open]');
    if (!btn) return;
    event.preventDefault();
    openFrom(btn);
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closeLightbox();
  });

  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeLightbox();
  });

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('lightbox-open');
  });

  document.addEventListener('keydown', function (event) {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
})();
