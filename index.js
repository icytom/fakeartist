const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));


const colours = ["red","green", "blue", "black", "orange", "yellow"];

function onConnection(socket) {

    let roomName = 'room1';
    socket.join(roomName);   //join new room

    socket.playername = socket.handshake.query.userName;    //add username to socket

    emitRoomClients(roomName);   //send list of players in room back to all clients in the room

    socket.on('disconnect', function () {
        emitRoomClients(roomName);
    });

    socket.on('drawing', (data) => io.sockets.in(roomName).emit('drawing', data));

    socket.on('startPainting', (data) =>  io.sockets.in(roomName).emit('startPainting'));

    


}

function emitRoomClients(room) {

    io.sockets.in(room).clients((err, clients) => {

        let clientsInRoom = [];
        for (let i in clients) {
            let clientname = io.sockets.connected[clients[i]].playername;
            clientsInRoom.push(
                {
                    "clientName":clientname,
                    "colour": colours[i],
                    "id":clients[i]
                }
                );
            
        }
        io.sockets.in(room).emit('roomClients', { "players": clientsInRoom });
    })
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));