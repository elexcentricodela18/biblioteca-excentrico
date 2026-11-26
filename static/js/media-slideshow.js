(function () {
  document.querySelectorAll('[data-media-slideshow]').forEach(function (root) {
    var slides = root.querySelectorAll('.media-slideshow__slide');
    var thumbs = root.querySelectorAll('.media-slideshow__thumb');
    if (slides.length < 2) return;

    function show(index) {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.hidden = !active;
      });
      thumbs.forEach(function (thumb, i) {
        var active = i === index;
        thumb.classList.toggle('is-active', active);
        thumb.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = parseInt(thumb.getAttribute('data-slide-to'), 10);
        if (!Number.isNaN(index)) show(index);
      });
    });
  });
})();
