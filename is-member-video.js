(function () {
  const CFG = {
    gateClass: 'is-video',
    memberClass: 'is-member',
    videoSel: '.video-js',
    iframeId: 'sutraWidgetIframe',
    pollMs: 1000,
    heightThreshold: 2000
  };

  let prev = 'unknown', seq = 0;

  function iframeHeightPx(el) {
    if (!el) return 0;
    try {
      const cs = getComputedStyle(el);
      const a = el.offsetHeight || 0;
      const b = el.clientHeight || 0;
      const c = parseFloat(cs.height) || 0;
      const d = el.getBoundingClientRect().height || 0;
      return Math.max(a, b, c, d);
    } catch { return 0; }
  }

  function detect() {
    const html = document.documentElement;
    const onVideo   = html.classList.contains(CFG.gateClass);
    const hasVideo  = onVideo && !!document.querySelector(CFG.videoSel);
    const iframeEl  = onVideo ? document.getElementById(CFG.iframeId) : null;
    const iHeight   = iframeHeightPx(iframeEl);
    const member    = onVideo && (hasVideo || iHeight > CFG.heightThreshold);
    const state     = member ? 'member' : 'none';
    return { onVideo, hasVideo, iHeight, state };
  }

  function apply(res) {
    const html = document.documentElement;
    if (res.state === 'member') html.classList.add(CFG.memberClass);
    else html.classList.remove(CFG.memberClass);
    window.__arketaVideoMember = res.state;
  }

  function tick(kind) {
    try {
      const res = detect();
      apply(res);
      if (res.state !== prev) {
        prev = res.state;
        console.info(
          `[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | iframeH=${Math.round(res.iHeight)} | state=${res.state}`
        );
        if (window.top && window.top !== window) {
          window.top.postMessage({ source: 'arketa-video-monitor', type: 'change', ...res }, '*');
        }
      }
    } catch (e) { console.warn('[VideoRead] error:', e); }
  }

  function start() {
    tick('init');
    setInterval(() => tick('poll'), CFG.pollMs);
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
