var input = document.getElementById('nickname');
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    if (input.value.trim() === '') {
      alert('Please enter a nickname');
    } else {
      if (getCookie('nickname') === '' || getCookie('nickname') === undefined) {
        setCookie('nickname', input.value, 20);
        window.location.href = '/';
      }
    }
  }
});