var channelForm = document.getElementById('channel-form');
var channelNameField = document.getElementById('channel-name');
var channelImageField = document.getElementById('channel-image');

channelForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var channelName = channelNameField.value.trim();
  if (channelName === '') {
    alert('Please enter a channel name.');
  } else if (channelImageField.files.length !== 1) {
    alert('Please select an image for the channel.');
  } else {
    submitForm(channelForm);
  }
});

var voicemojiForm = document.getElementById('voicemoji-form');
var voicemojiNameField = document.getElementById('voicemoji-name');
var voicemojiFileField = document.getElementById('voicemoji');

voicemojiForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var voicemojiName = voicemojiNameField.value.trim();
  if (voicemojiName === '') {
    alert('Please enter a voicemoji name.');
  } else if (voicemojiFileField.files.length !== 1) {
    alert('Please select an audio file for the voicemoji.');
  } else {
    submitForm(voicemojiForm);
  }
});

function updateProgress(form, e) {
  var percentComplete;
  var statusField = document.querySelector(
    '#' + form.id + ' .feedback-message'
  );
  if (e.lengthComputable) {
    percentComplete = (e.loaded / e.total) * 100;
    statusField.innerHTML = percentComplete;
  } else {
    percentComplete = 'Please wait...';
    statusField.innerHTML = percentComplete;
  }
}

function transferComplete(form, e) {
  var statusField = document.querySelector(
    '#' + form.id + ' .feedback-message'
  );
  var response = e.target.responseText;
  statusField.innerHTML = response;
}

function transferFailed(form, e) {
  var statusField = document.querySelector(
    '#' + form.id + ' .feedback-message'
  );
  statusField.innerHTML = 'An error occurred while transferring the file.';
}
function transferCancelled(form, e) {
  var statusField = document.querySelector(
    '#' + form.id + ' .feedback-message'
  );
  statusField.innerHTML = 'The transfer has been canceled by the user.';
}

function submitForm(form) {
  if (!form.action) return;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('progress', updateProgress.bind(this, form));
  xhr.addEventListener('load', transferComplete.bind(this, form));
  xhr.addEventListener('error', transferFailed.bind(this, form));
  xhr.addEventListener('abort', transferCancelled.bind(this, form));
  if (form.method.toLowerCase() === 'post') {
    xhr.open('post', form.action);
    xhr.send(new FormData(form));
  } else {
    var field,
      fieldType,
      file,
      search = '';
    for (var item = 0; item < form.elements.length; item++) {
      field = form.elements[item];
      if (!field.hasAttribute('name')) {
        continue;
      }
      fieldType =
        field.nodeName.toUpperCase() === 'INPUT'
          ? field.getAttribute('type').toUpperCase()
          : 'TEXT';
      if (fieldType === 'FILE') {
        for (
          file = 0;
          file < field.files.length;
          search +=
            '&' + escape(field.name) + '=' + escape(field.files[file++].name)
        );
      } else if (
        (fieldType !== 'RADIO' && fieldType !== 'CHECKBOX') ||
        field.checked
      ) {
        search += '&' + escape(field.name) + '=' + escape(field.value);
      }
    }
    xhr.open(
      'get',
      form.action.replace(/(?:\?.*)?$/, search.replace(/^&/, '?')),
      true
    );
    xhr.send();
  }
}
