import http from "./http";

function $(id) {
  return document.getElementById(id);
}

function log(text) {
  console.log(text);
}

const PSWDeviceId = {
  vendorId: 0x291f,
  productId: 0x0007,
};

const onDeviceAdded = function (device) {
  if (device.vendorId === PSWDeviceId.vendorId) {
    if (device.productId === PSWDeviceId.productId) {
      connectToDevice(device.deviceId);
    }
  }
};

const onDevicesEnumerated = function (devices) {
  if (chrome.runtime.lastError) {
    console.error(
      "Unable to enumerate devices: " + chrome.runtime.lastError.message
    );
    return;
  }

  for (var device of devices) {
    onDeviceAdded(device);
  }
};

const onDeviceRemoved = function (deviceId) {};

const enumerateDevices = function () {
  chrome.hid.getDevices({}, onDevicesEnumerated);
  chrome.hid.onDeviceAdded.addListener(onDeviceAdded);
  chrome.hid.onDeviceRemoved.addListener(onDeviceRemoved);
};

let connectionId = null;

const connectToDevice = function (deviceId) {
  chrome.hid.connect(deviceId, function (connectInfo) {
    if (!connectInfo) {
      console.warn("Unable to connect to device.");
    }
    connectionId = connectInfo.connectionId;
  });
};

class WSManager {
  constructor() {
    this.commandId = 0;
  }

  genHandleMessage(socket) {
    return function (e) {
      if (socket !== null) {
        socket.send(e.data);
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

  if (http.Server && http.WebSocketServer) {
    // init ws
    const server = new http.Server();
    const wsServer = new http.WebSocketServer(server);
    server.listen(port);
    // create struct for connection manager
    const manager = new WSManager();
    enumerateDevices();
    initWSServer(wsServer, manager.genHandleMessage, manager.genCloseMessage);
  }
});
