(function () {
  const CFG = {
    gateClass: 'is-video',
    memberClass: 'is-member',
    videoSel: '.video-js',                    // “video file thing”
    filterSel: '.on-demand-category__filter', // “on-demand thing”
    pollMs: 1000
  };

  let prev = 'unknown', seq = 0;

  function detect() {
    const html = document.documentElement;
    const onVideo   = html.classList.contains(CFG.gateClass);
    const hasVideo  = onVideo && !!document.querySelector(CFG.videoSel);
    const hasFilter = onVideo && !!document.querySelector(CFG.filterSel);

    // Rule:
    // 1) is-video && video => member
    // 2) is-video && !video && filter => member
    // 3) is-video && !video && !filter => none
    // 4) not is-video => none
    const member = onVideo && (hasVideo || (!hasVideo && hasFilter));
    const state = member ? 'member' : 'none';
    return { onVideo, hasVideo, hasFilter, state };
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
          `[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | hasFilter=${res.hasFilter} | state=${res.state}`
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
