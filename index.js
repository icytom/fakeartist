const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const words = ["Dog", "Cat", "Dragon", "Monkey", "Hedghog", "Rabbit"];

app.use(express.static(__dirname + '/public'));


const colours = ["red","green", "blue", "black", "orange", "yellow"];

function onConnection(socket) {

    let gameRoom;

    socket.on('joinRoom', function (data) {

        socket.playername = data.userName;   
       
        socket.join(data.roomName);  //join new room
        
        gameRoom = data.roomName;
      
        emitRoomClients(data.roomName);
    });
    
    socket.on('disconnect', function () {
        emitRoomClients(gameRoom);
    });

    socket.on('drawing', (data) => io.sockets.in(gameRoom).emit('drawing', data));

    socket.on('startPainting', () => {

        console.log("start painting");

        //choose word
        let returnData = {};
        returnData.word = words[(Math.floor(Math.random() * (words.length) ))];

        io.in(gameRoom).clients((err , clients) => { 
            
            let fakeArtist = Math.floor(Math.random() *  clients.length);
          
            console.log("fakeArtist", fakeArtist);
            console.log("clients", clients);
            console.log("clients_length", clients.length);

            for(i in clients){
                if(i == fakeArtist){
                    returnData.imFake = true;
                }else{
                  returnData.imFake = false;
                }
                
                console.log("returnData",returnData);
                io.to(clients[i]).emit('startPainting', returnData);
              //  socket.broadcast.to().emit('startPainting', returnData); 
            }
            

         })

    })
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
        io.sockets.in(room).emit('roomClients', { "players": clientsInRoom, "roomName": room});
    })
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));