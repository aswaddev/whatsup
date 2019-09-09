const express = require('express');
const app = express();
const http = require('http').Server(app);
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const os = require('os');
const db = require('./config/db');
const Channel = require('./models/Channel');
const Voicemoji = require('./models/Voicemoji');
const io = require('socket.io')(http);

var address = 'localhost';
if (os.networkInterfaces()['Wi-Fi']) {
  address = os.networkInterfaces()['Wi-Fi'][1]['address'];
}

// Setting up static resources
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Setting up bodyparser and cookieparser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setting up view engine
var hbs = exphbs.create({
  defaultLayout: 'layout',
  helpers: {
    excerpt: data => data.slice(0, 50) + '...',
    formatDate: date =>
      date.getDate() +
      '/' +
      (Number(date.getMonth()) + 1) +
      '/' +
      date.getFullYear(),
    formatDateTime: date => {
      return (
        date.getDate() +
        '/' +
        (Number(date.getMonth()) + 1) +
        '/' +
        date.getFullYear() // + '</br>' + date.toLocaleTimeString()
      );
    },
    getFirstName: name => {
      return name.split(' ')[0];
    },
    getExtName: filename => {
      return path.extname(filename).replace('.', '');
    },
    isEmpty: variable => {
      if (variable.length === 0) {
        return true;
      } else {
        return false;
      }
    },
    isEqual: (arg1, arg2) => {
      if (arg1 === arg2) {
        return true;
      } else {
        return false;
      }
    },
    isVoicemoji: type => {
      if (type === 'voicemoji') {
        return true;
      } else {
        return false;
      }
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//Loading Sockets Controller
require('./routes/socket')(http);

app.use('/', (req, res, next) => {
  if (req.cookies.nickname === undefined) {
    res.redirect('/login.html');
    return;
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  Channel.find({})
    .sort('-date_created')
    .exec((err, channels) => {
      if (err) {
        throw err;
      }
      res.render('index', {
        channels,
        user: req.cookies.nickname
      });
    });
});

app.get('/channel/paint', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paint.html'));
});

app.get('/channel/:id', (req, res) => {
  Channel.find({})
    .sort('-date_created')
    .exec((err, channels) => {
      if (err) throw err;
      Channel.find({ _id: req.params.id }, (err, channel) => {
        if (err) {
          res.redirect('/');
          return;
        }
        Voicemoji.find({})
          .sort('-date_uploaded')
          .exec((err, voicemojis) => {
            if (err) {
              res.redirect('/');
              return;
            }
            res.render('index', {
              id: req.params.id,
              channels,
              channel: channel[0],
              user: req.cookies.nickname,
              voicemojis
            });
          });
      });
    });
});

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.mimetype.split('/')[0] === 'audio') {
      cb(null, path.join(__dirname, 'public', 'sounds'));
    } else if (file.mimetype.split('/')[0] === 'image') {
      cb(null, path.join(__dirname, 'public', 'images'));
    }
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]
    );
  }
});

var upload = multer({ storage: storage });

app.post('/create-channel', upload.single('image'), (req, res) => {
  var channel = new Channel({
    creator: req.cookies.nickname,
    title: req.body.name,
    description: req.body.description,
    image: req.file.filename
  });
  channel.save().then(() => {
    res.send('Channel Created Successfully!');
  });
});

app.post('/upload-voicemoji', upload.single('voicemoji'), (req, res) => {
  var voicemoji = new Voicemoji({
    name: req.body.name,
    filename: req.file.filename
  });
  voicemoji.save().then(() => {
    res.send('Voicemoji Uploaded Successfully!');
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log('Server started on port: ' + address + ':' + PORT);
});
