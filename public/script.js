const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  path: '/peerjs',
  port: 4000,
});
const videoGrid = document.getElementById('video-grid');
const peers = {};
let myId;

myPeer.on('open', (id) => {
  myId = id;
  socket.emit('join-room', ROOM_ID, id);
});

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);
    myPeer.on('call', (call) => {
      call.answer(stream);
      const calledUserId = call.metadata;
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        console.log('received');
        addVideoStream(video, userVideoStream);
      });
      video.setAttribute('id', calledUserId);
    });
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }else{
    if(document.getElementById(userId)){
      document.getElementById(userId).remove();
    }
  }
});

function connectToNewUser(userId, stream) {
  const video = document.createElement('video');
  const call = myPeer.call(userId, stream, {metadata: myId});
  // call.metadata = userId;
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  video.setAttribute("id", userId);
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
