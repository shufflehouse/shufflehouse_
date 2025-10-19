(function () {
  // wait until SPA renders the section and fields
  const need = [
    '#firstName','#lastName','#email','label[for="phone"]',
    'label[for="avatarImage"]','.form-group.row',
    'label[for="birthday"]','label[for="address"]',
    'label[for="timezoneSetting"]','label[for="locationId"]'
  ];
  const secSel = 'html.is-account .userInformationForm section:nth-of-type(2)';

  function q(root, sel){ return root.querySelector(sel); }
  function blockByFor(root, f){
    const lab = q(root, `label[for="${f}"]`);
    return lab ? (lab.closest('.mb-3') || lab.parentElement) : null;
  }

  function run(){
    const sec = document.querySelector(secSel);
    if (!sec || !need.every(s => q(sec, s))) return false;

    // remove About me section (anywhere in the form)
    document.querySelectorAll('html.is-account .userInformationForm h4')
      .forEach(h => { if (h.textContent.trim().toLowerCase().startsWith('about me')) h.closest('section')?.remove(); });

    // remove pronouns and gender blocks
    ['pronouns','gender'].forEach(f => { const b = blockByFor(sec, f); if (b) b.remove(); });

    // build columns just after header row
    const header = q(sec, ':scope > .row:first-child');
    const left = document.createElement('div'); left.className = 'col-left';
    const right = document.createElement('div'); right.className = 'col-right';
    sec.insertBefore(left, header.nextSibling);
    sec.insertBefore(right, left.nextSibling);

    // gather nodes
    const firstName = q(sec, '#firstName')?.closest('.mb-3');
    const lastName  = q(sec, '#lastName')?.closest('.mb-3');
    const email     = q(sec, '#email')?.closest('.mb-3');
    const phone     = blockByFor(sec, 'phone');

    // profile photo label + sublabel wrapper
    let profileLabel = null;
    const avatarLbl = q(sec, 'label[for="avatarImage"]');
    if (avatarLbl) profileLabel = avatarLbl.closest('.align-items-center.d-flex')?.parentElement;
    const avatarRow = q(sec, '.form-group.row');

    const birthday  = blockByFor(sec, 'birthday');
    const address   = blockByFor(sec, 'address');
    const tz        = blockByFor(sec, 'timezoneSetting');
    const location  = blockByFor(sec, 'locationId');

    const append = (p,n)=>{ if(n && n.parentNode) p.appendChild(n); };

    // Column 1: first, last, email, phone
    [firstName, lastName, email, phone].forEach(n => append(left, n));

    // Column 2: profile label, avatar row, birthday, address, timezone, location
    [profileLabel, avatarRow, birthday, address, tz, location].forEach(n => append(right, n));

    return true;
  }

  // Try immediately, then observe until ready
  if (run()) return;
  const mo = new MutationObserver(() => { if (run()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();
