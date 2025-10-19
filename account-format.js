(function() {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const section = document.querySelector('html.is-account .userInformationForm section:first-of-type');
  if (!section) return;

  // Hide/remove pronouns block cleanly
  const pronounsLabel = section.querySelector('label[for="pronouns"]');
  if (pronounsLabel) {
    const pronounsBlock = pronounsLabel.closest('.mb-3') || pronounsLabel.parentElement;
    if (pronounsBlock) pronounsBlock.remove();
  }

  // Targets
  const firstNameBlock = section.querySelector('#firstName')?.closest('.mb-3');
  const lastNameBlock  = section.querySelector('#lastName')?.closest('.mb-3');
  const profileLabelBlock = section.querySelector('label[for="avatarImage"]')?.closest('div'); // the container holding label + "(Square image...)"
  const avatarRowBlock = section.querySelector('.form-group.row');

  // Tag with classes for grid placement
  if (firstNameBlock)  firstNameBlock.classList.add('firstNameBlock');
  if (lastNameBlock)   lastNameBlock.classList.add('lastNameBlock');
  if (profileLabelBlock) profileLabelBlock.classList.add('profileLabelBlock');
  if (avatarRowBlock)  avatarRowBlock.classList.add('avatarRowBlock');
})();
