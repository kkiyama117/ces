import http from "./http";

function $(id) {
    return document.getElementById(id);
}

function log(text) {
    console.log(text);
}

function receivedCallback(data) {
    log(data);
    return data;
}

class WSServer {
    constructor(wsServer, receivedCallback) {
        wsServer.addEventListener("request", function (req) {
            const socket = req.accept();
            socket.addEventListener("message", function (e) {
                socket.send(receivedCallback(e.data));
            });

            socket.addEventListener("close", function () {
                log("close");
            });
            return true;
        });
    }
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
        const server = new http.Server();
        const wsServer = new http.WebSocketServer(server);
        server.listen(port);
        const ws = new WSServer(wsServer, receivedCallback);
    }
});
