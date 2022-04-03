const Channel = require('../models/Channel');
const ObjectId = require('mongoose').Types.ObjectId;

const socketController = (server) => {
  const io = require('socket.io')(server);
  var state = null;
  var bgColor = null;
  // Listening to Socket Connections
  io.on('connection', (socket) => {
    console.log('Socket ID Connected: ' + socket.id);

    if (
      ObjectId.isValid(socket.handshake['query']['r_var']) ||
      socket.handshake['query']['r_var'] == 'paint'
    ) {
      var room = socket.handshake['query']['r_var'];
      socket.join(room);

      socket.on('draw', (payload) => {
        state = payload.state;
        // console.log(state);
        socket.to(room).emit('draw', payload);
      });

      socket.on('get current state', () => {
        socket.emit('get current state', state, bgColor);
      });

      socket.on('change background', (color) => {
        bgColor = color;
        socket.to(room).emit('change background', color);
      });

      socket.on('someone is drawing', (nickname) => {
        socket.to(room).emit('someone is drawing', nickname);
      });

      socket.on('stopped drawing', () => {
        socket.to(room).emit('stopped drawing');
      });

      socket.on('reset', () => {
        state = null;
        bgColor = null;
        socket.to(room).emit('reset');
      });

      socket.on('chat message', ({ sender, message }) => {
        Channel.findByIdAndUpdate(
          room,
          { $push: { messages: { sender, message } } },
          (err, channel) => {
            if (err) throw err;
            socket.to(room).emit('chat message', { sender, message });
          }
        );
      });

      socket.on('voicemoji', (payload) => {
        var voicemoji = {
          sender: payload.sender,
          message: payload.message,
          type: 'voicemoji',
          filename: payload.filename,
        };
        Channel.findByIdAndUpdate(
          room,
          { $push: { messages: voicemoji } },
          (err, channel) => {
            if (err) throw err;
            socket.to(room).emit('voicemoji', payload);
          }
        );
      });

      socket.on('someone is typing', (handle) => {
        socket.to(room).emit('someone is typing', handle);
      });

      socket.on('stopped typing', () => {
        socket.to(room).emit('stopped typing');
      });

      socket.on('disconnect', () => {
        socket.leave(room);
        console.log('Socket ID Disconnected: ' + socket.id);
      });
    }
    socket.on('disconnect', () => {
      console.log('Socket ID Disconnected: ' + socket.id);
    });
  });
};

module.exports = socketController;
