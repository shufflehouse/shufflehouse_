(function () {
  const VIDEO = "is-video";
  const PAY   = "is-paywall";
  const THRESHOLD = 2000;
  const SELECTOR = '#sutraWidgetIframe, iframe[src*="/iframe/"][src*="/videos"]';

  let ro = null, watched = null;

  function iframeEl() {
    return document.querySelector(SELECTOR);
  }

  function apply() {
    const root = document.documentElement;
    if (!root.classList.contains(VIDEO)) {
      root.classList.remove(PAY);
      return;
    }
    const f = iframeEl();
    if (!f) return;
    const h = f.getBoundingClientRect().height || 0;
    root.classList.toggle(PAY, h < THRESHOLD);
  }

  function watch(el) {
    if (watched === el) return;
    if (ro) ro.disconnect();
    watched = null;
    if (!el) return;
    ro = new ResizeObserver(apply);
    ro.observe(el);
    watched = el;
  }

  // Observe DOM for iframe/class changes so we can attach RO when elements appear.
  const mo = new MutationObserver(() => {
    watch(iframeEl());
    apply();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  mo.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // Fallback listeners
  window.addEventListener("resize", apply);
  window.addEventListener("load", apply);
  document.addEventListener("DOMContentLoaded", () => {
    watch(iframeEl());
    apply();
  });

  // Safety poll in case nothing fires
  setInterval(() => { watch(iframeEl()); apply(); }, 500);
})();
