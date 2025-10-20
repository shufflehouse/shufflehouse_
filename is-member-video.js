(function () {
  const CFG = {
    gateClass: 'is-video',
    paywallClass: 'is-paywall',
    videoSel: '.video-js',
    iframeId: 'sutraWidgetIframe',
    pollMs: 250,              // faster polling
    heightThreshold: 2000,
    missingGraceMs: 3000,     // don't treat missing iframe as paywall until 3s
    hysteresisTicks: 2        // require 2 consecutive checks to flip
  };

  let seq = 0;
  let ro = null, observedEl = null;
  let addCount = 0, removeCount = 0;
  let missingStart = 0;

  function getIframeHeight(el) {
    if (!el) return 0;
    try {
      const r = el.getBoundingClientRect();
      return r.height || el.offsetHeight || 0;
    } catch { return 0; }
  }

  function ensureIframeObserver(el) {
    if (observedEl === el) return;
    if (ro) ro.disconnect();
    observedEl = null;
    if (!el) return;
    ro = new ResizeObserver(() => tick('resize'));
    ro.observe(el);
    observedEl = el;
  }

  function applyPaywall(shouldPaywall) {
    const html = document.documentElement;
    if (shouldPaywall) html.classList.add(CFG.paywallClass);
    else html.classList.remove(CFG.paywallClass);
  }

  function tick(kind) {
    try {
      const html = document.documentElement;
      const onVideo = html.classList.contains(CFG.gateClass);
      const hasVideo = onVideo && !!document.querySelector(CFG.videoSel);
      const iframe = onVideo ? document.getElementById(CFG.iframeId) : null;
      const h = getIframeHeight(iframe);

      ensureIframeObserver(iframe);

      // Immediate clears
      if (!onVideo || hasVideo) {
        addCount = removeCount = 0;
        missingStart = 0;
        applyPaywall(false);
        return;
      }

      // No .video-js: decide paywall by iframe height or missing with grace
      let candidatePaywall = false;
      if (iframe) {
        // If iframe exists, use height
        candidatePaywall = h >= CFG.heightThreshold;
        if (!candidatePaywall) {
          // height < threshold → prefer clear
          missingStart = 0;
        }
      } else {
        // Missing iframe: start/continue grace timer
        if (!missingStart) missingStart = performance.now();
        candidatePaywall = (performance.now() - missingStart) >= CFG.missingGraceMs;
      }

      // Hysteresis: require consecutive confirmations
      if (candidatePaywall) {
        addCount++; removeCount = 0;
        if (addCount >= CFG.hysteresisTicks) applyPaywall(true);
      } else {
        removeCount++; addCount = 0;
        if (removeCount >= CFG.hysteresisTicks) applyPaywall(false);
      }

      // Optional log for debugging
      // console.info(`[PaywallCheck] [#${++seq}] ${kind} → onVideo=${onVideo} | hasVideo=${hasVideo} | iframeH=${Math.round(h)} | iframeMissing=${!iframe} | cand=${candidatePaywall} | add#=${addCount} | rm#=${removeCount}`);

    } catch (e) {
      console.warn('[PaywallCheck] error:', e);
    }
  }

  function start() {
    tick('init');
    setInterval(() => tick('poll'), CFG.pollMs);
    window.addEventListener('resize', () => tick('win-resize'));
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
