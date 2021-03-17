import http from './http';

chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('index.html', {
        innerBounds: {
            minWidth: 1024,
            minHeight: 768,
        },
    });

// MAIN
    function $(id) {
        return document.getElementById(id);
    }

    function log(text) {
        console.log(text);
    }

    const port = 9999;
    if (http.Server && http.WebSocketServer) {
        const server = new http.Server();
        const wsServer = new http.WebSocketServer(server);
        server.listen(port);
        openServer(wsServer)
    }

    function openServer(wsServer) {
        // A list of connected websockets.
        const connectedSockets = [];

        wsServer.addEventListener('request', function (req) {
            log('Client connected');
            const socket = req.accept();
            connectedSockets.push(socket);
            socket.addEventListener('message', function (e) {
                for (let i = 0; i < connectedSockets.length; i++) {
                    connectedSockets[i].send(e.data);
                }
            });

            socket.addEventListener('close', function () {
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

    // server.addEventListener('request', function (req) {
    //     let url = req.headers.url;
    //     req.serveUrl(url);
    //     return true;
    // });
});
