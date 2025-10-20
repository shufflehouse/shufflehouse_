(function () {
  const CFG = {
    gateClass: 'is-video',
    paywallClass: 'is-paywall',
    videoSel: '.video-js',
    iframeId: 'sutraWidgetIframe',
    pollMs: 1000,
    heightThreshold: 2000
  };

  let prev = 'none';
  let seq = 0;
  let ro = null;
  let observedEl = null;

  function getIframeHeight(el) {
    if (!el) return 0;
    try {
      const r = el.getBoundingClientRect();
      return r.height || el.offsetHeight || 0;
    } catch {
      return 0;
    }
  }

  function detect() {
    const html = document.documentElement;
    const onVideo = html.classList.contains(CFG.gateClass);
    const hasVideo = onVideo && !!document.querySelector(CFG.videoSel);
    const iframe = onVideo ? document.getElementById(CFG.iframeId) : null;
    const height = getIframeHeight(iframe);

    // Logic:
    // is-video + no .video-js + (height >= 2000 OR iframe missing) → add is-paywall
    // else remove
    const shouldPaywall = onVideo && !hasVideo && (height >= CFG.heightThreshold || height === 0);

    return { onVideo, hasVideo, height, shouldPaywall, iframe };
  }

  function apply(res) {
    const html = document.documentElement;
    if (res.shouldPaywall) html.classList.add(CFG.paywallClass);
    else html.classList.remove(CFG.paywallClass);
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

  function tick(kind) {
    try {
      const res = detect();
      apply(res);
      ensureIframeObserver(res.iframe);
      const state = res.shouldPaywall ? 'paywall' : 'none';
      if (state !== prev) {
        prev = state;
        console.info(
          `[PaywallCheck] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | iframeH=${Math.round(res.height)} | paywall=${res.shouldPaywall}`
        );
      }
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

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
