var logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', function() {
  document.cookie = 'nickname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/login.html';
});
