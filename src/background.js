import http from "./http";

function $(id) {
  return document.getElementById(id);
}

function log(text) {
  console.log(text);
}

class WSManager {
  constructor() {
    this.commandId = 0;
  }

  genHandleMessage(socket) {
    return function (e) {
      if (socket !== null) {
        socket.send(e.data);
        if (navigator.hid) {
          navigator.hid.getDevices().then((devices) => {
            log(devices);
            socket.send(devices);
          });
        }
      } else {
        log("socket is not exist!");
      }
    };
  }

  genCloseMessage() {
    return function () {
      log("close");
    };
  }
}

function initWSServer(wsServer, genHandleMessage, genCloseMessage) {
  wsServer.addEventListener("request", function (req) {
    const socket = req.accept();
    socket.addEventListener("message", genHandleMessage(socket));

    socket.addEventListener("close", genCloseMessage());
    return true;
  });
}

chrome.app.runtime.onLaunched.addListener(function () {
  // WINDOW
  chrome.app.window.create("index.html", {
    innerBounds: {
      minWidth: 1024,
      minHeight: 768,
    },
  });

  // MAIN
  const port = 9999;

  if (navigator.hid) {
    console.log(navigator.hid);
  }
  if (http.Server && http.WebSocketServer) {
    // init ws
    const server = new http.Server();
    const wsServer = new http.WebSocketServer(server);
    server.listen(port);
    // create struct for connection manager
    const manager = new WSManager();
    initWSServer(wsServer, manager.genHandleMessage, manager.genCloseMessage);
  }
});
