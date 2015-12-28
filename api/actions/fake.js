// import SocketIo from 'socket.io';
import { socketio } from '../api.js';

export default function fake() {
  var io = socketio;//require('socket.io')();
  console.log("===== io");
  console.log(io);
  // io.sockets.emit('msg', {
  //   from: "fakeFrom",
  //   text: "fakeText"
  // });
  io.emit('msg', {
    from: "fakeFrom",
    text: "fakeText"
  });
  // socket.emit('msg', {
  //   from: "fakeFrom",
  //   text: "fakeText"
  // });

  var io = require('socket.io')();
  io.on('connection', function(socket){
    socket.emit('msg', {
      from: "fakeFrom",
      text: "fakeText"
    });
  });

  return new Promise((resolve) => {
    resolve("ok!");
  });
}
