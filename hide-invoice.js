(function () {
  // Hide "Next invoice" <p> nodes under a given root (document or iframe document)
  function hideNextInvoice(root) {
    (root || document).querySelectorAll('p.m-0.p-0.card-text').forEach(p => {
      if (p.textContent.includes('Next invoice')) p.style.display = 'none';
    });
  }

  // Observe DOM mutations and keep hiding when nodes re-appear
  function observe(rootDoc) {
    const obs = new MutationObserver(() => {
      if (document.documentElement.classList.contains('is-account')) hideNextInvoice(rootDoc);
    });
    obs.observe(rootDoc.body || rootDoc, { childList: true, subtree: true, characterData: true });
    return obs;
  }

  // Attach to main doc and any same-origin iframes
  let observers = [];
  function attachAll() {
    // clear old
    observers.forEach(o => o.disconnect());
    observers = [];

    if (!document.documentElement.classList.contains('is-account')) return;

    // main document
    observers.push(observe(document));
    hideNextInvoice(document);

    // same-origin iframes (tabs that swap content)
    document.querySelectorAll('iframe').forEach(ifr => {
      try {
        const idoc = ifr.contentDocument;
        if (!idoc) return;
        ifr.addEventListener('load', () => {
          try {
            observers.push(observe(ifr.contentDocument));
            hideNextInvoice(ifr.contentDocument);
          } catch {}
        });
        observers.push(observe(idoc));
        hideNextInvoice(idoc);
      } catch {} // cross-origin, ignore
    });
  }

  // Run now and whenever route or class changes might occur
  const runSoon = () => setTimeout(attachAll, 100);

  document.addEventListener('DOMContentLoaded', runSoon);
  window.addEventListener('popstate', runSoon);

  // Hook SPA nav
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState = function(){ _push.apply(this, arguments); runSoon(); };
  history.replaceState = function(){ _replace.apply(this, arguments); runSoon(); };

  // Also poll lightly to catch tab systems that don’t touch history
  setInterval(attachAll, 1000);

  attachAll();
})();
