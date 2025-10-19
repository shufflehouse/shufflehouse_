(function () {
  const CFG = {
    gateClass: 'is-video',
    memberClass: 'is-member',
    videoSel: '.video-js',
    filterSel: '.on-demand-category__filter',
    pollMs: 1000
  };

  let prev = 'unknown', seq = 0;

  function detect() {
    const html = document.documentElement;
    const onVideo = html.classList.contains(CFG.gateClass);
    const hasFilter = onVideo && !!document.querySelector(CFG.filterSel);
    const hasVideo  = onVideo && !!document.querySelector(CFG.videoSel);
    const state = onVideo && (hasFilter || hasVideo) ? 'member' : 'none';
    return { onVideo, hasFilter, hasVideo, state };
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
          `[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | filter=${res.hasFilter} | hasVideo=${res.hasVideo} | state=${res.state}`
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
