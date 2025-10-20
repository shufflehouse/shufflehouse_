(function () {
  const CFG = {
    paywallClass: 'is-paywall',
    iframeId: 'sutraWidgetIframe',
    pollMs: 500,
    heightThreshold: 2000,
    videoSrcPattern: /\/iframe\/[^/]+\/videos/i
  };

  let ro = null, observed = null;
  let lastHeight = 0;

  function getIframe() {
    return document.getElementById(CFG.iframeId) || null;
  }

  function getHeight(el) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return r.height || el.offsetHeight || 0;
  }

  function onVideoPage(f) {
    return !!(f && typeof f.src === 'string' && CFG.videoSrcPattern.test(f.src));
  }

  function apply(paywall) {
    const html = document.documentElement;
    if (paywall) html.classList.add(CFG.paywallClass);
    else html.classList.remove(CFG.paywallClass);
  }

  function ensureRO(el) {
    if (observed === el) return;
    if (ro) ro.disconnect();
    observed = null;
    if (!el) return;
    ro = new ResizeObserver(() => tick('resize'));
    ro.observe(el);
    observed = el;
  }

  function tick(kind) {
    const f = getIframe();
    ensureRO(f);

    const onVideo = onVideoPage(f);
    lastHeight = getHeight(f);

    // Parent-visible rule:
    // add is-paywall iff onVideo && height >= 2000; else remove
    const shouldPaywall = onVideo && lastHeight >= CFG.heightThreshold;
    apply(shouldPaywall);

    // console.log(`[paywall] ${kind} onVideo=${onVideo} h=${Math.round(lastHeight)} → ${shouldPaywall}`);
  }

  // Optional: listen to embed height postMessage from the iframe if it sends it
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (d && typeof d.embedHeight === 'number') {
      // trust the reported height for faster reaction
      lastHeight = d.embedHeight;
      tick('msg');
    }
  });

  function start() {
    tick('init');
    setInterval(() => tick('poll'), CFG.pollMs);
    window.addEventListener('resize', () => tick('win'));
    window.addEventListener('popstate', () => tick('nav'));
    window.addEventListener('hashchange', () => tick('nav'));
    document.addEventListener('visibilitychange', () => tick('vis'));
    window.addEventListener('load', () => tick('load'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
