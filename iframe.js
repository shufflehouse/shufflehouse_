(function () {
  function setFlags() {
    const p = location.pathname || '';
    const isAccount  = p.includes('/iframe/shufflehouse/account');
    const isSchedule = p.includes('/iframe/shufflehouse/schedule');

    document.documentElement.classList.toggle('is-account',  isAccount);
    document.documentElement.classList.toggle('is-schedule', isSchedule);
    document.documentElement.setAttribute('data-route',
      isAccount ? 'account' : isSchedule ? 'schedule' : 'other');
  }

  const _push = history.pushState, _replace = history.replaceState;
  history.pushState    = function(){ _push.apply(this, arguments);    setFlags(); };
  history.replaceState = function(){ _replace.apply(this, arguments); setFlags(); };
  window.addEventListener('popstate', setFlags);
  document.addEventListener('DOMContentLoaded', setFlags);
  setFlags();
})();
