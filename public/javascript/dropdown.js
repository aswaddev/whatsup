var dropdownOpenBtns = document.querySelectorAll(
  '*[data-action="dropdown-open"]'
);
var dropdownBtn;
var dropdownMenu;
var isOpen = false;

dropdownOpenBtns.forEach(dropdownBtn => {
  dropdownBtn.addEventListener('click', toggleDropdown);
});

function toggleDropdown(e) {
  if (isOpen) {
    dropdownMenu.classList.remove('dropdown-effect');
    dropdownBtn.classList.remove('click-effect');
    isOpen = false;
  } else {
    dropdownBtn = this;
    dropdownMenu = document.getElementById(this.dataset.targetid);
    dropdownMenu.classList.add('dropdown-effect');
    dropdownBtn.classList.add('click-effect');
    isOpen = true;
  }
}

window.onclick = function(e) {
  if (dropdownBtn && dropdownMenu) {
    if (e.target !== dropdownBtn && e.target !== dropdownMenu) {
      if (dropdownMenu.classList.contains('dropdown-effect')) {
        dropdownMenu.classList.remove('dropdown-effect');
        dropdownBtn.classList.remove('click-effect');
      }
    }
  }
};
