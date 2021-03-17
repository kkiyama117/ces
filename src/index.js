import http from './http';

// MAIN
function $(id) {
  return document.getElementById(id);
}

function log(text) {
  // $('log').value += text + '\n';
  console.log(text);
}

const port = 9999;
let isServer = false;
if (http.Server && http.WebSocketServer) {
  const server = new http.Server();
  const wsServer = new http.WebSocketServer(server);
  server.listen(port);
  isServer = true;

  server.addEventListener('request', function(req) {
    let url = req.headers.url;
    if (url === '/') {
      url = '/index.html';
    }
    // Serve the pages of this chrome application.
    req.serveUrl(url);
    return true;
  });

  // A list of connected websockets.
  const connectedSockets = [];

  wsServer.addEventListener('request', function(req) {
    log('Client connected');
    const socket = req.accept();
    connectedSockets.push(socket);

    // When a message is received on one socket, rebroadcast it on all
    // connected sockets.
    socket.addEventListener('message', function(e) {
      for (let i = 0; i < connectedSockets.length; i++) {
        connectedSockets[i].send(e.data);
      }
    });

    // When a socket is closed, remove it from the list of connected sockets.
    socket.addEventListener('close', function() {
      log('Client disconnected');
      for (let i = 0; i < connectedSockets.length; i++) {
        if (connectedSockets[i] === socket) {
          connectedSockets.splice(i, 1);
          break;
        }
      }
    });
    return true;
  });
}