(function () {
    'use strict';

    var buttons = document.querySelectorAll('.btn-up-to-top');
    if (!buttons.length) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setVisible(btn, visible) {
        btn.hidden = !visible;
        btn.classList.toggle('is-visible', visible);
    }

    function updateVisibility() {
        var show = window.scrollY > 0;
        buttons.forEach(function (btn) {
            setVisible(btn, show);
        });
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    }

    buttons.forEach(function (btn) {
        btn.addEventListener('click', scrollToTop);
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
})();
