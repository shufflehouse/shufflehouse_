(function () {
  // Remove "About me" section on all sizes
  (function removeAboutMe() {
    const h4 = Array.from(document.querySelectorAll('html.is-account .userInformationForm h4'))
      .find(el => el.textContent.trim().toLowerCase().startsWith('about me'));
    if (h4) {
      const sec = h4.closest('section');
      if (sec) sec.remove();
    }
  })();

  // Desktop-only reorder
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const sec = document.querySelector('html.is-account .userInformationForm section:nth-of-type(2)');
  if (!sec) return;

  // Helpers to grab blocks
  const byFor = (name) => sec.querySelector(`label[for="${name}"]`)?.closest('.mb-3') || null;
  const firstName   = sec.querySelector('#firstName')?.closest('.mb-3') || byFor('firstName');
  const lastName    = sec.querySelector('#lastName')?.closest('.mb-3')  || byFor('lastName');
  const email       = sec.querySelector('#email')?.closest('.mb-3')     || byFor('email');
  const phone       = byFor('phone');
  const birthday    = byFor('birthday');
  const address     = byFor('address');
  const timezone    = byFor('timezoneSetting');
  const location    = byFor('locationId');

  // Profile photo label + sublabel wrapper
  let profileLabel = null;
  {
    const label = sec.querySelector('label[for="avatarImage"]');
    if (label) profileLabel = label.closest('.align-items-center.d-flex')?.parentElement || null;
  }
  // Avatar preview row
  const avatarRow = sec.querySelector('.form-group.row');

  // Remove pronouns and gender blocks cleanly
  ['pronouns', 'gender'].forEach(f => {
    const el = byFor(f);
    if (el) el.remove();
  });

  // Create columns right after the header row
  const headerRow = sec.querySelector(':scope > .row:first-child');
  const colLeft = document.createElement('div');
  const colRight = document.createElement('div');
  colLeft.className = 'col-left';
  colRight.className = 'col-right';

  if (headerRow && headerRow.nextSibling) {
    sec.insertBefore(colLeft, headerRow.nextSibling);
    sec.insertBefore(colRight, colLeft.nextSibling);
  } else {
    sec.appendChild(colLeft);
    sec.appendChild(colRight);
  }

  // Append in requested order, skipping nulls
  const appendSafe = (parent, node) => { if (node && node.parentNode) parent.appendChild(node); };

  // Column 1
  [firstName, lastName, email, phone].forEach(n => appendSafe(colLeft, n));

  // Column 2
  [profileLabel, avatarRow, birthday, address, timezone, location].forEach(n => appendSafe(colRight, n));
})();
