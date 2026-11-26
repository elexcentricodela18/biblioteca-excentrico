(function () {
    'use strict';

    function syncClearBtn(form) {
        var input = form.querySelector('.buscar-input');
        var clearBtn = form.querySelector('.buscar-clear');
        if (!input || !clearBtn) return;
        clearBtn.hidden = input.value.trim().length === 0;
    }

    function bindForm(form) {
        var input = form.querySelector('.buscar-input');
        var clearBtn = form.querySelector('.buscar-clear');
        if (!input || !clearBtn) return;

        input.addEventListener('input', function () {
            syncClearBtn(form);
        });

        clearBtn.addEventListener('click', function () {
            input.value = '';
            syncClearBtn(form);
            input.focus();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        syncClearBtn(form);
    }

    document.querySelectorAll('.buscador-form').forEach(bindForm);

    window.syncBuscadorClear = function (inputEl) {
        if (!inputEl) return;
        var form = inputEl.closest('.buscador-form');
        if (form) syncClearBtn(form);
    };
})();
