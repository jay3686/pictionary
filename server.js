var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
var drawer = false;


io.on('connection', (socket) => {
    console.log('new client connected!', socket.id);
    
    if(drawer == false) {
        drawer = socket.id
        console.log(`${socket.id} is now drawing`);
    }
    io.to(socket.id).emit('isDrawing', drawer == socket.id ? true: false)

    socket.on('disconnect', function() {
        console.log('A user has disconnected', socket.id);
        if(drawer == socket.id) {
            drawer = false;
            console.log(`${socket.id} is no longer drawing`);
            socket.broadcast.emit('winner', 'DISCONNECT');
        }
    });

    socket.on('draw', (points) => {
        socket.broadcast.emit('draw', points);
    });
    
    socket.on('guess', (guess) => {
        console.log('Guessed for ', guess);
        socket.broadcast.emit('guess', guess);
    });

    socket.on('winner', (guess) => {
        console.log('Winning guess!', guess);
        socket.broadcast.emit('winner', guess);
    });
})

server.listen(8080);