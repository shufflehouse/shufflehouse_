(function () {
  function setFlags() {
    const p = (location.pathname || '').toLowerCase();

    const isAccount  = p.includes('/iframe/shufflehouse/account');
    const isSchedule = p.includes('/iframe/shufflehouse/schedule');
    const isVideo    = p.includes('/iframe/shufflehouse/videos');

    const route =
      isAccount  ? 'account'  :
      isSchedule ? 'schedule' :
      isVideo    ? 'video'    : 'other';

    const root = document.documentElement;
    root.classList.toggle('is-account',  isAccount);
    root.classList.toggle('is-schedule', isSchedule);
    root.classList.toggle('is-video',    isVideo);
    root.setAttribute('data-route', route);
  }

  const _push = history.pushState, _replace = history.replaceState;
  history.pushState    = function(){ _push.apply(this, arguments);    setFlags(); };
  history.replaceState = function(){ _replace.apply(this, arguments); setFlags(); };
  window.addEventListener('popstate', setFlags);
  document.addEventListener('DOMContentLoaded', setFlags);
  setFlags();
})();
