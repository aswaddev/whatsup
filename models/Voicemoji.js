const mongoose = require('mongoose');

const VoicemojiSchema = new mongoose.Schema({
  name: String,
  filename: String,
  date_uploaded: {
    type: Date,
    default: Date.now
  }
});

const Voicemoji = mongoose.model('Voicemoji', VoicemojiSchema);

module.exports = Voicemoji;
