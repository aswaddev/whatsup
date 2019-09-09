var menuBtn = document.getElementById('menu-icon');
var leftPanel = document.querySelector('.container .left-panel');

menuBtn.addEventListener('click', function() {
  menuBtn.classList.toggle('fa-times');
  menuBtn.classList.toggle('click-effect');
  leftPanel.classList.toggle('left-panel-open');
});
