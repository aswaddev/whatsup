var nickname = getCookie('nickname');
var channelID = window.location.pathname.split('/')[2];
var socket;
socket = io(window.location.host, {
  query: 'r_var=' + channelID
});
var notification = document.getElementById('notification');
var messageForm = document.getElementById('message-form');
var messageList = document.getElementById('chat-messages').firstElementChild;
var chatBox = document.getElementById('chat-messages');
var typingStatus = document.getElementById('typing-status');
var messageField = document.getElementById('message-field');
var currentChannel = document.getElementById(channelID);
var currentLastMessage = currentChannel.getElementsByClassName(
  'last-message'
)[0];
var tempLastMessage = currentLastMessage.textContent;
var fakeMessageField;
chatBox.scrollTop = chatBox.scrollHeight;

setTimeout(function() {
  fakeMessageField = document.querySelector('.emoji-wysiwyg-editor');
  messageField.addEventListener('input', notifyTypingStatus);
  messageField.addEventListener('keypress', notifyTypingStatus);
  messageField.addEventListener('change', notifyTypingStatus);
  fakeMessageField.addEventListener('input', notifyTypingStatus);
  fakeMessageField.addEventListener('keypress', notifyTypingStatus);
  fakeMessageField.addEventListener('change', notifyTypingStatus);
}, 2000);

messageForm.addEventListener('submit', sendMessage);

function notifyTypingStatus() {
  if (
    messageField.value.trim() === '' &&
    fakeMessageField.textContent.trim() === ''
  ) {
    socket.emit('stopped typing');
  } else {
    socket.emit('someone is typing', nickname);
  }
}

function sendMessage(e) {
  e.preventDefault();
  if (messageField.value === '') {
    return;
  }
  var payload = {
    sender: nickname,
    message: messageField.value
  };
  displayMessage('sender', payload);
  socket.emit('chat message', payload);
  socket.emit('stopped typing');
  fakeMessageField.textContent = '';
}

socket.on('chat message', function(payload) {
  displayMessage('other', payload);
  playNotificationSound();
  typingStatus.textContent = '';
});

socket.on('someone is typing', function(handle) {
  typingStatus.textContent = handle + ' is typing...';
  currentLastMessage.innerHTML =
    '<div class="typing">' + handle + ' is typing...</div>';
});

socket.on('stopped typing', function() {
  typingStatus.textContent = '';
  currentLastMessage.innerHTML = tempLastMessage;
});

function displayMessage(source, payload) {
  currentLastMessage.innerText = payload.message;
  var li = document.createElement('li');
  li.classList.add(source);
  var node = document.createElement('span');
  node.classList.add('node');
  var body = document.createElement('div');
  body.classList.add('body');
  var data = document.createElement('div');
  data.classList.add('data');
  var name = document.createElement('div');
  name.classList.add('name');
  var smallName = document.createElement('small');
  smallName.appendChild(document.createTextNode(payload.sender));
  name.appendChild(smallName);
  var date = document.createElement('div');
  date.classList.add('date');
  var smallDate = document.createElement('small');
  var now = new Date();
  var time =
    now.getDate() +
    '/' +
    (Number(now.getMonth()) + 1) +
    '/' +
    now.getFullYear();
  smallDate.appendChild(document.createTextNode(time));
  date.appendChild(smallDate);
  data.appendChild(name);
  data.appendChild(date);
  body.appendChild(document.createTextNode(payload.message));
  body.appendChild(data);
  if (source === 'sender') {
    li.appendChild(body);
    li.appendChild(node);
  } else if (source === 'other') {
    li.appendChild(node);
    li.appendChild(body);
  }
  messageList.appendChild(li);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function playNotificationSound() {
  notification.currentTime = 0;
  notification.pause();
  notification.play();
}

if (sessionStorage.allowedAutoplay == undefined) {
  sessionStorage.allowedAutoplay = 'forbidden';
}

var allowAutoplayBtn = document.getElementById('allow-autoplay');
allowAutoplayBtn.addEventListener('click', function() {
  if (sessionStorage.allowedAutoplay == 'allowed') {
    sessionStorage.allowedAutoplay = 'forbidden';
  } else if (sessionStorage.allowedAutoplay == 'forbidden') {
    sessionStorage.allowedAutoplay = 'allowed';
  }
  document.querySelectorAll('audio').forEach(function(audio) {
    audio.muted = !audio.muted;
  });
  this.classList.toggle('fa-volume-mute');
  this.classList.toggle('fa-volume-up');
});

if (sessionStorage.allowedAutoplay == 'allowed') {
  document.querySelectorAll('audio').forEach(function(audio) {
    audio.muted = false;
  });
  allowAutoplayBtn.classList.remove('fa-volume-mute');
  allowAutoplayBtn.classList.add('fa-volume-up');
}

var voicemojis = Array.from(document.getElementsByClassName('voicemoji'));
var voicemojiPlayButtons = Array.from(
  document.getElementsByClassName('play-voicemoji')
);

voicemojis.forEach(function(voicemoji) {
  voicemoji.addEventListener('click', broadcastVoicemoji);
});

var prevVoicemoji;
var currVoicemoji;
var currPlaying;
voicemojiPlayButtons.forEach(function(voicemojiPlayButton) {
  voicemojiPlayButton.addEventListener('click', startPlayingVoicemoji);
});

function broadcastVoicemoji() {
  var voicemoji = {
    sender: nickname,
    message: this.dataset.name,
    voicemoji_id: this.dataset.id,
    filename: this.dataset.url
  };
  displayVoicemoji('sender', voicemoji);
  socket.emit('voicemoji', voicemoji);
}

socket.on('voicemoji', playVoicemoji);

function playVoicemoji(payload) {
  displayVoicemoji('other', payload);
}

function startPlayingVoicemoji() {
  var playButton = this;
  playButton.classList.toggle('fa-play-circle');
  playButton.classList.toggle('fa-pause-circle');
  if (currPlaying == playButton) {
    if (playButton.classList.contains('fa-play-circle')) {
      currVoicemoji.pause();
    } else {
      currVoicemoji.play();
    }
  } else {
    if (currPlaying && currPlaying.classList.contains('fa-pause-circle')) {
      currPlaying.click();
    }
    currVoicemoji = new Audio(playButton.dataset.src);
    currVoicemoji.addEventListener(
      'ended',
      function(button, e) {
        button.classList.add('fa-play-circle');
        button.classList.remove('fa-pause-circle');
      }.bind(this, playButton)
    );
    if (prevVoicemoji == undefined) {
      prevVoicemoji = currVoicemoji;
      currVoicemoji.play();
    } else {
      prevVoicemoji.currentTime = 0;
      prevVoicemoji.pause();
      prevVoicemoji = currVoicemoji;
      currVoicemoji.play();
    }
  }
  currPlaying = playButton;
}

function displayVoicemoji(source, payload) {
  currentLastMessage.innerHTML =
    '<i class="fas fa-headphones" style="font-size: 15px;margin-right: 10px;"></i>' +
    payload.message;
  var li = document.createElement('li');
  li.classList.add(source);
  var node = document.createElement('span');
  node.classList.add('node');
  var player = document.createElement('div');
  player.classList.add('player');
  var data = document.createElement('div');
  data.classList.add('data');
  var name = document.createElement('div');
  name.classList.add('name');
  var smallName = document.createElement('small');
  smallName.appendChild(document.createTextNode(payload.sender));
  name.appendChild(smallName);
  var date = document.createElement('div');
  date.classList.add('date');
  var smallDate = document.createElement('small');
  var now = new Date();
  var time =
    now.getDate() +
    '/' +
    (Number(now.getMonth()) + 1) +
    '/' +
    now.getFullYear();
  smallDate.appendChild(document.createTextNode(time));
  date.appendChild(smallDate);
  data.appendChild(name);
  data.appendChild(date);
  var top = document.createElement('div');
  top.classList.add('top');
  var bottom = document.createElement('div');
  bottom.classList.add('bottom');
  var voicemojiName = document.createElement('span');
  voicemojiName.appendChild(document.createTextNode(payload.message));
  var playButton = document.createElement('i');
  playButton.classList.add('far', 'fa-play-circle', 'play-voicemoji');
  playButton.dataset.src = payload.filename;
  playButton.addEventListener('click', startPlayingVoicemoji);
  playButton.click();
  top.appendChild(playButton);
  top.appendChild(voicemojiName);
  bottom.appendChild(data);
  player.appendChild(top);
  player.appendChild(bottom);
  if (source === 'sender') {
    li.appendChild(player);
    li.appendChild(node);
  } else if (source === 'other') {
    li.appendChild(node);
    li.appendChild(player);
  }
  messageList.appendChild(li);
  chatBox.scrollTop = chatBox.scrollHeight;
}
