(function () {
  const BAR_SEL = '.d-flex.mb-1.px-0.py-3.justify-content-between';
  const AVATAR_SEL = '.sb-avatar, .sb-avatar__image, .dropdown .sb-avatar, .dropdown .sb-avatar__image';
  const LOGIN_BTN_SEL = 'button.primaryColor, button.btn-outline-primary, button,[role="button"],a[role="button"]';
  const LOGIN_TEXT = ['login','sign in'];

  let prev;

  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  }
  function hasLoginButton() {
    return Array.from(document.querySelectorAll(LOGIN_BTN_SEL))
      .some(el => visible(el) && LOGIN_TEXT.some(t => (el.textContent||'').toLowerCase().includes(t)));
  }
  function hasAvatar() {
    return document.querySelector(AVATAR_SEL) != null;
  }
  function getState() {
    const s = window.__arketaLoginState;
    if (s === 'logged-in' || s === 'logged-out') return s;
    if (hasLoginButton()) return 'logged-out';
    if (hasAvatar()) return 'logged-in';
    return 'unknown';
  }
  function apply() {
    const bar = document.querySelector(BAR_SEL);
    if (!bar) return;
    const state = getState();
    if (state === prev) return;
    prev = state;
    if (state === 'logged-out') {
      bar.style.visibility = 'hidden';
    } else if (state === 'logged-in') {
      bar.style.visibility = 'visible';
    }
  }

  function start() {
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true});
    const pollId = setInterval(apply, 800);
    setTimeout(() => clearInterval(pollId), 15000);
    window.addEventListener('message', (e) => {
      if (e.data?.source === 'arketa-login-monitor' && e.data.type === 'change') apply();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
