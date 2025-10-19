(function () {
  const CFG = {
    gateClass: 'is-video',   // html class to gate checks
    memberClass: 'is-member',
    selector: '.video-js',   // treat as “video present”
    pollMs: 1000
  };

  let prev = 'unknown';
  let seq = 0;

  function detect() {
    const html = document.documentElement;
    const onVideo = html.classList.contains(CFG.gateClass);
    const hasVideo = onVideo && !!document.querySelector(CFG.selector);
    const state = onVideo && hasVideo ? 'member' : 'none';
    return { onVideo, hasVideo, state };
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
          `[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | state=${res.state}`
        );
        if (window.top && window.top !== window) {
          window.top.postMessage({ source: 'arketa-video-monitor', type: 'change', ...res }, '*');
        }
      }
    } catch (e) {
      console.warn('[VideoRead] error:', e);
    }
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
