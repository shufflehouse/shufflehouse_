(function () {
  const CFG = {
    gateClass: 'is-video',
    paywallClass: 'is-paywall',
    videoSel: '.video-js',
    iframeId: 'sutraWidgetIframe',
    pollMs: 500,
    heightThreshold: 2000
  };

  let ro = null, observedEl = null;

  function getIframeHeight(el) {
    if (!el) return 0;
    try {
      const cs = getComputedStyle(el);
      const r  = el.getBoundingClientRect().height || 0;
      const oh = el.offsetHeight || 0;
      const ch = el.clientHeight || 0;
      const sh = parseFloat(cs.height) || 0;
      return Math.max(r, oh, ch, sh);
    } catch { return 0; }
  }

  function compute() {
    const html = document.documentElement;
    const onVideo = html.classList.contains(CFG.gateClass);
    const hasVideo = onVideo && !!document.querySelector(CFG.videoSel);
    const iframe = onVideo ? document.getElementById(CFG.iframeId) : null;
    const h = getIframeHeight(iframe);

    // Only this condition adds paywall:
    const shouldPaywall = onVideo && !hasVideo && h >= CFG.heightThreshold;

    if (shouldPaywall) html.classList.add(CFG.paywallClass);
    else html.classList.remove(CFG.paywallClass);

    ensureIframeObserver(iframe);
  }

  function ensureIframeObserver(el) {
    if (observedEl === el) return;
    if (ro) ro.disconnect();
    observedEl = null;
    if (!el) return;
    ro = new ResizeObserver(() => compute());
    ro.observe(el);
    observedEl = el;
  }

  function start() {
    compute();
    setInterval(compute, CFG.pollMs);
    window.addEventListener('resize', compute);
    window.addEventListener('popstate', compute);
    window.addEventListener('hashchange', compute);
    document.addEventListener('visibilitychange', compute);
    window.addEventListener('load', compute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
