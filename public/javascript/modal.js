var modalOpenBtns = document.querySelectorAll('*[data-action="modal-open"]');
var modalBg = document.getElementById('modal-background');
const modalCloseBtns = document.querySelectorAll(
  '*[data-action="modal-close"]'
);

modalOpenBtns.forEach(function(modalBtn) {
  modalBtn.addEventListener('click', openModal);
});

modalCloseBtns.forEach(function(modalBtn) {
  modalBtn.addEventListener('click', closeModal);
});

var modalId;
var isOpen = false;

function openModal(e) {
  modalId = this.dataset.modalid;
  document.getElementById(modalId).classList.remove('close');
  modalBg.classList.remove('close');
  document.getElementById(modalId).classList.add('open');
  modalBg.classList.add('open');
}

function closeModal(e) {
  modalId = this.dataset.modalid;
  document.getElementById(modalId).classList.remove('open');
  modalBg.classList.remove('open');
  document.getElementById(modalId).classList.add('close');
  modalBg.classList.add('close');
}

window.addEventListener('click', function(e) {
  if (e.target == modalBg) {
    document.getElementById(modalId).classList.remove('open');
    modalBg.classList.remove('open');
    document.getElementById(modalId).classList.add('close');
    modalBg.classList.add('close');
  }
});
