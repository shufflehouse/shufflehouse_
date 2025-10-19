(function () {
  const NOTE_TEXT =
    'If you would like to update your payment method, please send us a quick email and we can provide you a secure link to do so :)';

  let scheduled = false, navObs = null, domObs = null;

  function isAccount() {
    return document.documentElement.classList.contains('is-account');
  }

  function scan(root = document) {
    if (!isAccount()) return;

    // 1) Hide ANY <p.card-text> that contains "Next invoice"
    root.querySelectorAll('p.card-text').forEach(p => {
      if (/Next invoice/i.test(p.textContent)) p.style.display = 'none';
    });

    // 2) Hide "Modify payment method" dropdown item anywhere it appears
    root.querySelectorAll('.dropdown-menu .dropdown-item').forEach(a => {
      if (/Modify\s*payment\s*method/i.test(a.textContent)) a.style.display = 'none';
    });

    // 3) If a "View Details" panel is open, append the note once
    root.querySelectorAll('.collapse.show').forEach(panel => {
      if (!panel.querySelector('[data-sh-note="payment-method"]')) {
        const p = document.createElement('p');
        p.dataset.shNote = 'payment-method';
        p.style.marginTop = '0.5rem';
        p.textContent = NOTE_TEXT;
        // append inside the panel content
        (panel.firstElementChild || panel).appendChild(p);
      }
    });
  }

  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; scan(); }, 120);
  }

  function watchTabs() {
    if (!isAccount()) return;
    const nav = document.querySelector('nav.nav.nav-tabs[role="tablist"]');
    if (!nav) return;

    if (navObs) navObs.disconnect();
    navObs = new MutationObserver(muts => {
      for (const m of muts) {
        const t = m.target;
        if (t instanceof HTMLElement && t.classList.contains('nav-link') && t.classList.contains('active')) {
          scheduleScan();
          break;
        }
      }
    });
    navObs.observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });

    nav.addEventListener('click', scheduleScan, { passive: true });
    nav.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') scheduleScan(); });
  }

  function watchDom() {
    if (domObs) domObs.disconnect();
    domObs = new MutationObserver(() => { if (isAccount()) scheduleScan(); });
    domObs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  // Re-bind on SPA nav
  const rebind = () => { watchTabs(); scheduleScan(); };
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState    = function(){ _push.apply(this, arguments); setTimeout(rebind, 150); };
  history.replaceState = function(){ _replace.apply(this, arguments); setTimeout(rebind, 150); };
  window.addEventListener('popstate', () => setTimeout(rebind, 150));
  document.addEventListener('DOMContentLoaded', () => { watchDom(); rebind(); });

  // Fallback: periodic nudge while on account
  setInterval(() => { if (isAccount()) scheduleScan(); }, 2000);

  // Also trigger when “View Details” is clicked
  document.addEventListener('click', e => {
    const el = e.target.closest('button, a');
    if (!el) return;
    if (/view details/i.test(el.textContent || '')) scheduleScan();
  });

  // initial
  watchDom();
  rebind();
})();
