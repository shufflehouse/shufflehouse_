(function () {
  const CFG = {
    gateClass: 'is-video',
    notMemberClass: 'isnot-member',
    videoSel: '.video-js',
    iframeId: 'sutraWidgetIframe',
    pollMs: 1000,
    heightThreshold: 1000
  };

  let prev = 'unknown';
  let seq = 0;

  function iframeHeight(el) {
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
    const height = iframeHeight(iframe);

    // Only one case triggers "not-member"
    const notMember = onVideo && !hasVideo && height < CFG.heightThreshold;
    const state = notMember ? 'not-member' : 'none';

    return { onVideo, hasVideo, height, state };
  }

  function apply(res) {
    const html = document.documentElement;
    if (res.state === 'not-member') {
      html.classList.add(CFG.notMemberClass);
    } else {
      html.classList.remove(CFG.notMemberClass);
    }
    window.__arketaVideoMember = res.state;
  }

  function tick(kind) {
    try {
      const res = detect();
      apply(res);
      if (res.state !== prev) {
        prev = res.state;
        console.info(
          `[VideoRead] [#${++seq}] ${kind} → onVideo=${res.onVideo} | hasVideo=${res.hasVideo} | iframeHeight=${Math.round(
            res.height
          )} | state=${res.state}`
        );
        if (window.top && window.top !== window) {
          window.top.postMessage(
            { source: 'arketa-video-monitor', type: 'change', ...res },
            '*'
          );
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
