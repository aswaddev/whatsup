const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  title: String,
  creator: String,
  description: String,
  image: String,
  date_created: {
    type: Date,
    default: Date.now
  },
  messages: [
    {
      sender: String,
      message: String,
      type: {
        type: String,
        default: 'text'
      },
      filename: {
        type: String,
        default: ''
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

const Channel = mongoose.model('Channel', channelSchema);

// Flush Channels Collection
// Channel.find({})
//   .remove()
//   .exec();

// Fetch Channels

// Create channels function
function create(channel) {
  var newChannel = new Channel(channel);
  newChannel.save().then(() => {
    console.log(newChannel);
  });
}

module.exports = Channel;
