(function () {
    'use strict';

    var triggers = document.querySelectorAll('.tooltip-trigger');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
        var describedId = trigger.getAttribute('data-tooltip-described');
        if (describedId && document.getElementById(describedId)) {
            trigger.setAttribute('aria-describedby', describedId);
        }

        trigger.addEventListener('blur', function () {
            trigger.classList.remove('is-tooltip-dismissed');
        });

        trigger.addEventListener('mouseleave', function () {
            trigger.classList.remove('is-tooltip-dismissed');
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        var active = document.activeElement;
        if (active && active.classList.contains('tooltip-trigger')) {
            active.classList.add('is-tooltip-dismissed');
        }
    });
})();
