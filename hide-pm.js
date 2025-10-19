(function () {
  const FLAG_CLASS = 'sh-has-billing';
  let scanTimer = null, navObserver = null;

  function isAccount() {
    return document.documentElement.classList.contains('is-account');
  }

  function tagAndHideOnce() {
    if (!isAccount()) return;

    document.querySelectorAll('.p-1.card-body').forEach(card => {
      const hasDropdown = !!card.querySelector('.dropdown');
      const hasNextInv = Array.from(card.querySelectorAll('p.card-text'))
        .some(p => /Next invoice/i.test(p.textContent));

      if (hasDropdown || hasNextInv) {
        card.classList.add(FLAG_CLASS);
        // hide "Modify payment method" in this card's dropdown
        card.querySelectorAll('.dropdown-menu .dropdown-item').forEach(a => {
          if (/Modify\s*payment\s*method/i.test(a.textContent)) a.style.display = 'none';
        });
      }
    });
  }

  // brief polling window to catch lazy renders
  function scheduleScan() {
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = setInterval(tagAndHideOnce, 400);
    tagAndHideOnce();
    setTimeout(() => clearInterval(scanTimer), 10000);
  }

  function watchTabs() {
    if (!isAccount()) return;

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

  // Re-bind on SPA route changes
  const rebindSoon = () => setTimeout(watchTabs, 150);
  document.addEventListener('DOMContentLoaded', rebindSoon);
  window.addEventListener('popstate', rebindSoon);
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState    = function(){ _push.apply(this, arguments); rebindSoon(); };
  history.replaceState = function(){ _replace.apply(this, arguments); rebindSoon(); };

  // Fallback: keep observers alive while on account
  setInterval(() => { if (isAccount()) watchTabs(); }, 2000);

  // Also rescan when a dropdown opens or "View Details" is clicked
  document.addEventListener('click', () => scheduleScan(), { passive: true });

  // initial
  watchTabs();
})();
