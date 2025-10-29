(function () {
  function allPsDeep(root) {
    const out = [];
    const walker = (node) => {
      if (node.querySelectorAll) out.push(...node.querySelectorAll('p'));
      const kids = node.children ? [...node.children] : [];
      for (const k of kids) {
        if (k.shadowRoot) walker(k.shadowRoot);
      }
    };
    walker(root);
    return out;
  }

  function hideOrBlankRenews(root = document) {
    allPsDeep(root).forEach(p => {
      const txt = (p.textContent || '').trim();
      if (/Renews/i.test(txt)) {
        // multiple strategies so one wins
        p.textContent = '';                 // remove text
        p.hidden = true;                    // HTML hidden
        p.style.setProperty('display','none','important'); // force hide
        p.setAttribute('data-hidden-renews','1');
      }
    });
  }

  // initial + click + observer
  const run = () => { try { hideOrBlankRenews(); } catch(e) { console.error(e); } };
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('click', run);

  new MutationObserver(() => run())
    .observe(document.documentElement, { childList: true, subtree: true });

  // if in an iframe, also try each frame
  [...document.querySelectorAll('iframe')].forEach(f => {
    try {
      f.addEventListener('load', () => hideOrBlankRenews(f.contentDocument));
    } catch {}
  });
})();
