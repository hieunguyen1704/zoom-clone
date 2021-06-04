const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
require('dotenv').config();
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res)=> {
  res.redirect(`/${uuidV4()}`);
})

app.get('/:roomId', (req, res)=> {
  res.render('room', {roomId: req.params.roomId});
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId)=>{
     console.log('User '+ userId + ' joined room ' + roomId);
     socket.join(roomId);
     socket.to(roomId).emit('user-connected', userId);
     socket.on('disconnect', () =>{
       socket.to(roomId).emit('user-disconnected', userId);
     })
  })
})

console.log(`Server is running in port: ${process.env.PORT || 4000}`);
server.listen(process.env.PORT || 4000);
