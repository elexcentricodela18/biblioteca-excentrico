(function () {
  const sections = Array.from(document.querySelectorAll('[data-grupo-nav]'));
  const links = document.querySelectorAll('[data-dot-nav]');
  if (!sections.length || !links.length) return;

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById(link.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('is-active', link.dataset.target === id);
    });
  }

  function resolveActive() {
    const probe = window.innerHeight * 0.35;
    let current = sections[0].id;

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probe) {
        current = section.id;
      }
    });

    const firstRect = sections[0].getBoundingClientRect();
    if (window.scrollY < 24 || firstRect.top >= 0) {
      current = sections[0].id;
    }

    setActive(current);
  }

  window.addEventListener('scroll', resolveActive, { passive: true });
  window.addEventListener('resize', resolveActive);
  resolveActive();
})();
