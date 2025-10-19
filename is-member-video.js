(function () {
  const CFG = {
    gateClass: 'is-video',
    memberClass: 'is-member',
    notMemberClass: 'isnot-member',
    selector: '.video-js',
    pollMs: 1000
  };

  let prev = 'unknown';
  let seq = 0;

  function detect() {
    const html = document.documentElement;
    const onVideo = html.classList.contains(CFG.gateClass);
    const hasVideo = onVideo && !!document.querySelector(CFG.selector);
    let state = 'unknown';
    if (onVideo) state = hasVideo ? 'member' : 'not-member';
    return { onVideo, hasVideo, state };
  }

  function apply(res) {
    const html = document.documentElement;
    if (!res.onVideo) {
      html.classList.remove(CFG.memberClass, CFG.notMemberClass);
      window.__arketaVideoMember = 'unknown';
      return;
    }
    html.classList.toggle(CFG.memberClass,     res.state === 'member');
    html.classList.toggle(CFG.notMemberClass,  res.state === 'not-member');
    window.__arketaVideoMember = res.state;
  }

  function tick(kind) {
    try {
      const res = detect();
      apply(res);
      if (res.state !== prev) {
        prev = res.state;
        console.info(`[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | state=${res.state}`);
        if (window.top && window.top !== window) {
          window.top.postMessage({ source: 'arketa-video-monitor', type: 'change', ...res }, '*');
        }
      }
    } catch (e) {
      console.warn('[VideoRead] error:', e);
    }
  }

  // Always on: light polling + a few nav nudges.
  function start() {
    tick('init');
    setInterval(() => tick('poll'), CFG.pollMs);
    window.addEventListener('popstate',  () => tick('nav'));
    window.addEventListener('hashchange',() => tick('nav'));
    document.addEventListener('visibilitychange', () => tick('vis'));
    window.addEventListener('load', () => tick('load'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
