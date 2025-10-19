(function () {
  function hideNextInvoice() {
    document.querySelectorAll('p.m-0.p-0.card-text').forEach(p => {
      if (p.textContent.includes('Next invoice')) {
        p.style.display = 'none';
      }
    });
  }

  // Run once and also on route change
  document.addEventListener('DOMContentLoaded', hideNextInvoice);
  window.addEventListener('popstate', hideNextInvoice);
  const _push = history.pushState, _replace = history.replaceState;
  history.pushState = function(){ _push.apply(this, arguments); hideNextInvoice(); };
  history.replaceState = function(){ _replace.apply(this, arguments); hideNextInvoice(); };
  hideNextInvoice();
})();
