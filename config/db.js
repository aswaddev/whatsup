const mongoose = require('mongoose');

// Database connectivity
mongoose.connect(
  'mongodb+srv://aswad:mern@cluster0.flffz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
  }
);
var db = mongoose.connection;

// Setting up error handler
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  // we're connected!
  console.log('MongoDB Connected...');
});

module.exports = db;
