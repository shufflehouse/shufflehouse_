(function () {
  function hideRenewPs(root = document) {
    root.querySelectorAll('.form-group p.mb-0').forEach(p => {
      if (/Renews/i.test(p.textContent)) {
        // force-hide even against !important rules
        p.style.setProperty('display', 'none', 'important');
        p.setAttribute('data-hidden-renews', '1');
      }
    });
  }

  function observe(target) {
    new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) hideRenewPs(n);
        }
      }
    }).observe(target, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    hideRenewPs();
    observe(document.body); // catch re-renders anywhere
  });

  document.addEventListener('click', hideRenewPs);
})();
