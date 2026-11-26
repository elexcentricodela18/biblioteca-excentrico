/* ── Obras — búsqueda + tabs de período (patrón Línea de tiempo / Historia) ── */

document.addEventListener('DOMContentLoaded', function () {
    const lista = document.getElementById('obras-lista');
    if (!lista) return;

    const filas = Array.from(lista.querySelectorAll('.archivo-fila'));
    const grupos = Array.from(lista.querySelectorAll('.archivo-grupo-anio'));
    const vacio = document.getElementById('obras-vacio');
    const vacioMsg = document.getElementById('obras-vacio-msg');
    const busqueda = document.getElementById('obras-busqueda-input');
    const busquedaInfo = document.getElementById('obras-busqueda-info');
    const formBuscar = document.getElementById('obras-buscar-form');
    const btnVacioSec = document.getElementById('obras-vacio-sec');
    const btnVacioPri = document.getElementById('obras-vacio-pri');
    const tabsPeriodo = document.getElementById('obras-tabs-periodo');
    const tabBtns = tabsPeriodo
        ? Array.from(tabsPeriodo.querySelectorAll('.tabs__tab[data-tab-value]'))
        : [];
    const TAB_PERIODO_SEL = '#obras-tabs-periodo .tabs__tab';
    const PERIODO_LABELS = {
        '2020': '2020-2029',
        '2010': '2010-2019',
        '2000': '2000-2009',
        '1980': '1980-1999',
        'todos': 'todas las obras'
    };
    let filtroDecada = '2020';
    let filtroDecadaBrowse = '2020';
    let query = '';

    const PERIODOS = {
        '2020': { min: 2020, max: 2029 },
        '2010': { min: 2010, max: 2019 },
        '2000': { min: 2000, max: 2009 },
        '1980': { min: 1980, max: 1999 }
    };

    function okPeriodo(anioStr) {
        if (filtroDecada === 'todos') return true;
        const r = PERIODOS[filtroDecada];
        if (!r) return true;
        const anio = parseInt(anioStr, 10);
        if (Number.isNaN(anio)) return false;
        return anio >= r.min && anio <= r.max;
    }

    function isMobileControles() {
        return window.matchMedia('(max-width: 767px)').matches;
    }

    const scrollHintEls = [];

    function updateScrollHint(el) {
        if (!el) return;
        if (!isMobileControles()) {
            el.classList.remove('is-scrollable', 'is-scroll-end', 'is-scroll-start');
            return;
        }
        const max = el.scrollWidth - el.clientWidth;
        const sl = el.scrollLeft;
        el.classList.toggle('is-scrollable', max > 1);
        el.classList.toggle('is-scroll-end', sl >= max - 1);
        el.classList.toggle('is-scroll-start', sl <= 1);
    }

    function bindScrollHint(el) {
        if (!el) return;
        el.classList.add('scroll-hint');
        scrollHintEls.push(el);
        function refresh() {
            updateScrollHint(el);
        }
        refresh();
        el.addEventListener('scroll', refresh, { passive: true });
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(refresh).observe(el);
        }
    }

    function refreshAllScrollHints() {
        scrollHintEls.forEach(updateScrollHint);
    }

    window.addEventListener('resize', refreshAllScrollHints);

    function scrollControlIntoView(btn) {
        if (!btn || !isMobileControles()) return;
        btn.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
        window.setTimeout(refreshAllScrollHints, 350);
    }

    function setTabGroup(selector, btn) {
        document.querySelectorAll(selector).forEach(function (b) {
            const activo = b === btn;
            b.classList.toggle('is-active', activo);
            b.setAttribute('aria-selected', activo ? 'true' : 'false');
        });
        if (selector === TAB_PERIODO_SEL) scrollControlIntoView(btn);
    }

    function clearTabSelection() {
        tabBtns.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-selected', 'false');
        });
    }

    function restoreBrowseTab() {
        if (!tabsPeriodo) return;
        tabsPeriodo.classList.remove('tabs-bar--search-expanded');
        const restoreBtn = document.querySelector(
            '#obras-tabs-periodo .tabs__tab[data-tab-value="' + filtroDecadaBrowse + '"]'
        );
        if (restoreBtn) {
            filtroDecada = filtroDecadaBrowse;
            setTabGroup(TAB_PERIODO_SEL, restoreBtn);
        }
    }

    function clearSoloBusqueda() {
        const prevQuery = query;
        query = '';
        busqueda.value = '';
        if (prevQuery !== '') {
            restoreBrowseTab();
        }
        if (window.syncBuscadorClear) window.syncBuscadorClear(busqueda);
        filtrar();
    }

    function setSearchExpandedUI(expanded) {
        if (!tabsPeriodo) return;
        tabsPeriodo.classList.toggle('tabs-bar--search-expanded', expanded);
        if (expanded) clearTabSelection();
    }

    function updateBusquedaInfo(totalMatch) {
        if (!busquedaInfo) return;
        if (query === '') {
            busquedaInfo.textContent = '';
            busquedaInfo.classList.remove('is-visible');
            busquedaInfo.setAttribute('aria-hidden', 'true');
            return;
        }
        const n = totalMatch === 1 ? '1 resultado' : totalMatch + ' resultados';
        const q = busqueda.value.trim();
        busquedaInfo.textContent = n + ' para «' + q + '» en todas las obras';
        busquedaInfo.classList.add('is-visible');
        busquedaInfo.removeAttribute('aria-hidden');
    }

    function verTodasLasObras() {
        query = '';
        busqueda.value = '';
        if (window.syncBuscadorClear) window.syncBuscadorClear(busqueda);
        filtroDecada = 'todos';
        filtroDecadaBrowse = 'todos';
        tabsPeriodo.classList.remove('tabs-bar--search-expanded');
        const todosTab = document.querySelector('#obras-tabs-periodo .tabs__tab[data-tab-value="todos"]');
        if (todosTab) setTabGroup(TAB_PERIODO_SEL, todosTab);
        filtrar();
    }

    function updateVacioAcciones(enBusqueda, periodoRestringido) {
        if (!btnVacioSec || !btnVacioPri) return;

        const hayRecuperacion = enBusqueda || periodoRestringido;
        if (!hayRecuperacion) {
            btnVacioSec.hidden = true;
            btnVacioPri.hidden = true;
            return;
        }

        btnVacioSec.hidden = false;
        btnVacioPri.hidden = false;
        btnVacioSec.textContent = enBusqueda ? 'Limpiar búsqueda' : 'Limpiar filtros';
        btnVacioPri.textContent = 'Ver todas las obras';
    }

    function updateVacio(totalMatch) {
        if (!vacio || !vacioMsg) return;
        if (totalMatch > 0) {
            vacio.hidden = true;
            return;
        }

        vacio.hidden = false;
        const enBusqueda = query !== '';
        const periodoRestringido = !enBusqueda && filtroDecada !== 'todos';
        const periodoLabel = PERIODO_LABELS[filtroDecada] || filtroDecada;

        if (enBusqueda) {
            vacioMsg.textContent = 'No hay obras que coincidan con «' + busqueda.value.trim() + '».';
        } else if (periodoRestringido) {
            vacioMsg.textContent = 'No hay obras en ' + periodoLabel + '.';
        } else {
            vacioMsg.textContent = 'No hay obras que coincidan.';
        }

        updateVacioAcciones(enBusqueda, periodoRestringido);
    }

    function filtrar() {
        const enBusqueda = query !== '';
        let totalMatch = 0;

        filas.forEach(function (f) {
            const esObra = f.dataset.tipoGrupo === 'obras';
            const okDecada = enBusqueda || okPeriodo(f.dataset.anio);
            const titulo = f.dataset.titulo || '';
            const extra = f.dataset.extra || '';
            const anio = f.dataset.anio || '';
            const okQuery = query === '' || titulo.includes(query) || anio.includes(query) || extra.includes(query);
            const match = esObra && okDecada && okQuery;

            f.hidden = !match;
            if (match) totalMatch++;
        });

        grupos.forEach(function (g) {
            const visibles = g.querySelectorAll('.archivo-fila:not([hidden])');
            g.hidden = visibles.length === 0;
        });

        updateBusquedaInfo(totalMatch);
        updateVacio(totalMatch);
    }

    function limpiarTodo() {
        filtroDecada = '2020';
        filtroDecadaBrowse = '2020';
        query = '';
        busqueda.value = '';
        if (window.syncBuscadorClear) window.syncBuscadorClear(busqueda);
        restoreBrowseTab();
        filtrar();
    }

    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filtroDecada = btn.dataset.tabValue;
            filtroDecadaBrowse = filtroDecada;
            setTabGroup(TAB_PERIODO_SEL, btn);
            if (query !== '') {
                query = '';
                busqueda.value = '';
                if (window.syncBuscadorClear) window.syncBuscadorClear(busqueda);
                setSearchExpandedUI(false);
            }
            filtrar();
        });
    });

    if (busqueda) {
        busqueda.addEventListener('input', function () {
            const prevQuery = query;
            query = busqueda.value.toLowerCase().trim();
            if (query !== '' && prevQuery === '') {
                setSearchExpandedUI(true);
            } else if (query === '' && prevQuery !== '') {
                restoreBrowseTab();
            }
            filtrar();
        });
    }

    if (formBuscar) {
        formBuscar.addEventListener('submit', function (e) {
            e.preventDefault();
            filtrar();
        });
    }

    if (btnVacioSec) {
        btnVacioSec.addEventListener('click', function () {
            if (query !== '') {
                clearSoloBusqueda();
            } else {
                limpiarTodo();
            }
        });
    }

    if (btnVacioPri) {
        btnVacioPri.addEventListener('click', verTodasLasObras);
    }

    filtrar();
    bindScrollHint(tabsPeriodo);
});
