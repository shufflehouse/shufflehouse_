(function () {
  const secSel = 'html.is-account .userInformationForm section:nth-of-type(2)';

  function blockByFor(root, f){
    const lab = root.querySelector(`label[for="${f}"]`);
    return lab ? (lab.closest('.mb-3') || lab.parentElement) : null;
  }
  function ready(sec){
    return sec?.querySelector('#firstName')
        && sec.querySelector('#lastName')
        && sec.querySelector('#email')
        && blockByFor(sec,'phone')
        && sec.querySelector('label[for="avatarImage"]')
        && sec.querySelector('.form-group.row')
        && blockByFor(sec,'birthday')
        && blockByFor(sec,'address')
        && blockByFor(sec,'timezoneSetting')
        && blockByFor(sec,'locationId');
  }

  function run(){
    const sec = document.querySelector(secSel);
    if (!ready(sec)) return false;

    // remove pronouns/gender/About me (all sizes)
    ['pronouns','gender'].forEach(f => blockByFor(sec,f)?.remove());
    document.querySelectorAll('html.is-account .userInformationForm h4')
      .forEach(h => { if (h.textContent.trim().toLowerCase().startsWith('about me')) h.closest('section')?.remove(); });

    // build two column containers right after header row
    const header = sec.querySelector(':scope > .row:first-child');
    let left = sec.querySelector(':scope > .col-left');
    let right = sec.querySelector(':scope > .col-right');
    if (!left){
      left = document.createElement('div'); left.className='col-left';
      right = document.createElement('div'); right.className='col-right';
      sec.insertBefore(left, header.nextSibling);
      sec.insertBefore(right, left.nextSibling);
    }

    // collect nodes
    const firstName = sec.querySelector('#firstName').closest('.mb-3');
    const lastName  = sec.querySelector('#lastName').closest('.mb-3');
    const email     = sec.querySelector('#email').closest('.mb-3');
    const phone     = blockByFor(sec,'phone');

    const avatarLabel = sec.querySelector('label[for="avatarImage"]');
    const profileLabel = avatarLabel ? avatarLabel.closest('.align-items-center.d-flex')?.parentElement : null;
    const avatarRow    = sec.querySelector('.form-group.row');

    const birthday  = blockByFor(sec,'birthday');
    const address   = blockByFor(sec,'address');
    const tz        = blockByFor(sec,'timezoneSetting');
    const location  = blockByFor(sec,'locationId');

    const append = (p,n)=>{ if(n) p.appendChild(n); };

    // enforce exact order
    [firstName, lastName, email, phone].forEach(n => append(left, n));
    [profileLabel, avatarRow, birthday, address, tz, location].forEach(n => append(right, n));

    return true;
  }

  if (run()) return;
  const mo = new MutationObserver(() => { if (run()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();
