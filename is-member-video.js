(function () {
  const ROOT = document.documentElement;
  const IFRAME_SEL = '#sutraWidgetIframe, iframe[src*="/iframe/"][src*="/videos"]';
  const H_THRESH = 2000;

  function iframeEl(){ return document.querySelector(IFRAME_SEL); }
  function height(){ const f=iframeEl(); return f ? (f.getBoundingClientRect().height||0) : 0; }

  function apply(){
    if (!ROOT.classList.contains('is-video')) return ROOT.classList.remove('is-paywall');
    ROOT.classList.toggle('is-paywall', height() < H_THRESH);
  }

  // react to size changes + lazy loads
  let ro; const watch = el => { if (ro) ro.disconnect(); if (el){ ro=new ResizeObserver(apply); ro.observe(el); } };
  const rebind = () => watch(iframeEl());

  // wires
  document.addEventListener('DOMContentLoaded', () => { rebind(); apply(); });
  window.addEventListener('load', () => { rebind(); apply(); });
  window.addEventListener('resize', apply);

  // keep alive for SPA/lazy DOM
  const mo = new MutationObserver(() => { rebind(); apply(); });
  mo.observe(ROOT, { attributes:true, attributeFilter:['class'] });
  mo.observe(document.body || ROOT, { childList:true, subtree:true });

  setInterval(apply, 500);
})();
