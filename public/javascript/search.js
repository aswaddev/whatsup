var searchInput = document.getElementById('search');

searchInput.addEventListener('input', function() {
  var query = searchInput.value.toUpperCase();
  var channels = Array.from(document.getElementsByClassName('channel'));
  channels.map(function(channel) {
    var channelTitle = channel.getElementsByClassName('channel-title')[0];
    if (channelTitle.innerText.toUpperCase().search(query) > -1) {
      channel.style.display = '';
    } else {
      channel.style.display = 'none';
    }
  });
});
