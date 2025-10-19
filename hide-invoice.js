(function () {
  let scanTimer = null, navObserver = null;

  function hideNextInvoiceOnce() {
  if (!document.documentElement.classList.contains('is-account')) return;

  document.querySelectorAll('p.m-0.p-0.card-text').forEach(p => {
    if (/\bNext\s*invoice\b/i.test(p.textContent)) {
      p.style.display = 'none';
    }
  });
}


  // Start a brief polling window to catch lazy renders
  function scheduleScan() {
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = setInterval(hideNextInvoiceOnce, 400);
    // also try immediately
    hideNextInvoiceOnce();
    // safety stop after 10s per activation
    setTimeout(() => clearInterval(scanTimer), 10000);
  }

  function watchTabs() {
    if (!document.documentElement.classList.contains('is-account')) return;

    const nav = document.querySelector('nav.nav.nav-tabs[role="tablist"]');
    if (!nav) return;

    // Recreate observer if needed
    if (navObserver) navObserver.disconnect();
    navObserver = new MutationObserver(muts => {
      for (const m of muts) {
        const t = m.target;
        if (t instanceof HTMLElement && t.classList.contains('nav-link') && t.classList.contains('active')) {
          scheduleScan();
          break;
        }
      }
    });
    navObserver.observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });

    // Also react to clicks/keyboard on the tablist
    nav.addEventListener('click', scheduleScan, { passive: true });
    nav.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') scheduleScan(); });
  }

  // Re-bind when route changes or DOM is rebuilt
  const rebindSoon = () => setTimeout(watchTabs, 150);
  document.addEventListener('DOMContentLoaded', rebindSoon);
  window.addEventListener('popstate', rebindSoon);
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState   = function(){ _push.apply(this, arguments); rebindSoon(); };
  history.replaceState= function(){ _replace.apply(this, arguments); rebindSoon(); };

  // Fallback: periodically ensure observers exist while on account
  setInterval(() => {
    if (document.documentElement.classList.contains('is-account')) watchTabs();
  }, 2000);

  // initial
  watchTabs();
})();
