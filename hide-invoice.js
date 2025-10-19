(function () {
  let scanTimer = null, navObserver = null;

  function hideNextInvoiceOnce() {
    if (!document.documentElement.classList.contains('is-account')) return;

    document.querySelectorAll('p.m-0.p-0.card-text').forEach(p => {
      if (/Next\s*invoice/i.test(p.textContent)) p.style.display = 'none';
    });
    // keep interval alive; more may load later
  }

  function scheduleScan() {
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = setInterval(hideNextInvoiceOnce, 400);
    hideNextInvoiceOnce();
    setTimeout(() => clearInterval(scanTimer), 10000); // stop after 10s window
  }

  function watchTabs() {
    if (!document.documentElement.classList.contains('is-account')) return;

    const nav = document.querySelector('nav.nav.nav-tabs[role="tablist"]');
    if (!nav) return;

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

    nav.addEventListener('click', scheduleScan, { passive: true });
    nav.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') scheduleScan(); });
  }

  const rebindSoon = () => setTimeout(watchTabs, 150);
  document.addEventListener('DOMContentLoaded', rebindSoon);
  window.addEventListener('popstate', rebindSoon);
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState   = function(){ _push.apply(this, arguments); rebindSoon(); };
  history.replaceState= function(){ _replace.apply(this, arguments); rebindSoon(); };

  setInterval(() => {
    if (document.documentElement.classList.contains('is-account')) watchTabs();
  }, 2000);

  watchTabs();
})();
