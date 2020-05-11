'use strict';

(function () {

    let socket;
    let canvas = document.getElementsByClassName('whiteboard')[0];
    let context = canvas.getContext('2d');

    const states = {
        "START_MENU": "startmenu",
        "WAITING_FOR_PLAYER": "waiting",
        "GAME": "game"
    }

    let state = states.START_MENU;

    let myColour = "black";

    let drawing = false;

    let current = {};

    let playersInRoom;

    //---------------------introduction modal----------------------
     //find ready to play button and listen for click
    document.getElementById("btnJoinRoom").addEventListener("click", joinRoomClicked);
    document.getElementById("btnCreateRoom").addEventListener("click", createRoomClicked);

    //Join room clicked
    function joinRoomClicked(e){
        e.preventDefault(); //stop page refresh
        document.getElementById("btnJoinRoom").removeEventListener("click", joinRoomClicked);
        document.getElementById("btnCreateRoom").removeEventListener("click", createRoomClicked);
        document.getElementById("introductionModal").style.display ="none";
        document.getElementById("joinRoomModal").style.display = "block";

        let joinRoomForm = document.getElementById('joinRoomForm');
        joinRoomForm.addEventListener('submit', joinRoom);
    }

    //create room clicked
    function createRoomClicked(e){
        e.preventDefault(); //stop page refresh
        document.getElementById("btnJoinRoom").removeEventListener("click", joinRoomClicked);
        document.getElementById("btnCreateRoom").removeEventListener("click", createRoomClicked);
        document.getElementById("introductionModal").style.display ="none";
        document.getElementById("createRoomModal").style.display = "block";
        
        let createRoomForm = document.getElementById('createRoomForm');
        createRoomForm.addEventListener('submit', createRoom);
        
    }

    //---------------------Create Room modal----------------------
    
    function createRoom(e){

        e.preventDefault(); //stop page refresh
        //get name
        let playerName = e.srcElement["playerName"].value;
        let roomName = e.srcElement["roomName"].value;
        
        if(playerName == "" || roomName == ""){
            console.log("returning");
            return;
        }

        socket = io();



        let createRoomForm = document.getElementById('createRoomForm');
        createRoomForm.removeEventListener('submit', createRoom);

        //Create new room here
            
        socket.emit('joinRoom', {
            userName: playerName,
            roomName: roomName
          });
    
        socket.on('roomClients', onPlayerRoomEvent);
              
        socket.on('startPainting', onStartPainting);
        
        //hide current modal

        document.getElementById("createRoomModal").style.display = "none";
        
        //show next modal
        document.getElementById("waitingToStartModal").style.display = "block";
    
    }

    //-------------------Join existing room modal

    function joinRoom(e){
        e.preventDefault(); //stop page refresh
        //get name
        let playerName = e.srcElement["playerName"].value;
        let roomName = e.srcElement["roomName"].value;
        
        if(playerName == "" || roomName == ""){
            return;
        }


        socket = io();

        let createRoomForm = document.getElementById('joinRoomForm');
        createRoomForm.removeEventListener('submit', joinRoom);

        //join existing room here room here
       

        socket.emit('joinRoom', {
            userName: playerName,
            roomName: roomName
          });
      


        socket.on('roomClients', onPlayerRoomEvent);
          
        socket.on('startPainting', onStartPainting);
        
        //hide current modal
        document.getElementById("joinRoomModal").style.display = "none";
        
        //show next modal
        document.getElementById("waitingToStartModal").style.display = "block";

    }


    function onPlayerRoomEvent(data){
        
        //display room name
        let roomSpan = document.getElementById("roomNameDisplay");
        roomSpan.innerText = data.roomName;

        playersInRoom = data.players;

        //add to list if just entered
        if(data.players){
            let list = document.getElementById("playerList");
            list.innerHTML = '';

            for(let i in data.players){
                let item = document.createElement("li");
                item.innerHTML = data.players[i].clientName;
                item.style.color = data.players[i].colour;
                list.appendChild(item);

                if(data.players[i].id == socket.id){
                    myColour = data.players[i].colour;
                }
            }

            if(data.players.length >= 1){
                document.getElementById("pwaiting").style.display = "none";
                document.getElementById("btnStart").style.display = "block";
                document.getElementById("btnStart").disabled = false;

                let playForm = document.getElementById('playForm');
                playForm.addEventListener('submit', startGame);
                //show waiting box
               
            }else{
                document.getElementById("pwaiting").style.display = "block";
                document.getElementById("btnStart").style.display = "none";
                document.getElementById("btnStart").disabled = true;

                let playForm = document.getElementById('playForm');
                playForm.removeEventListener('submit', startGame);
            }
       
        }
    }

    function startGame(e){
        e.preventDefault(); //stop page refresh

        socket.emit('startPainting');
    }


    function onStartPainting(data){

        state = states.GAME;

        //hide box
        document.getElementById("waitingToStartModal").style.display= "none";

        //show 
        document.getElementById("gameui").style.display= "block";

        //remove all elements
        let ul = document.getElementById("inGamePlayerList");

        ul.innerHTML = "";

        for(let i in playersInRoom){

           let li = document.createElement("li");
            let htmlString = "<div class='colourBox'></div><span class='playerName'>" + playersInRoom[i].clientName + "</span>"
           li.innerHTML = htmlString;
           let div = li.getElementsByTagName("div");
           
           div[0].style.backgroundColor = playersInRoom[i].colour;

            let ul = document.getElementById("inGamePlayerList");

            ul.appendChild(li);

        }

        //

        if(!data.imFake){
            let w = document.getElementById("wordToDraw");
            w.innerText = data.word;
        }else{
            let w = document.getElementById("wordToDrawP");
            w.innerText = "You are the Fake artist!";
        }
        

        
        createCanvasListeners();
    }

    function createCanvasListeners(){
        
        //canvas listeners for drawing
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

        // listen for drawing event from socket server
        socket.on('drawing', onDrawingEvent);
    } 

    //resize canvas
    window.addEventListener('resize', onResize, false);
    onResize();

    // 
    function drawLine(x0, y0, x1, y1, color, emit) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 5;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        let w = canvas.width;
        let h = canvas.height;

        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }

    function onMouseDown(e) {
        drawing = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, myColour, true);
    }

    function onMouseMove(e) {
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, myColour, true);
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    // limit the number of events per second
    function throttle(callback, delay) {
        let previousCall = new Date().getTime();
        return function () {
            let time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    // called when drawing event comes from socket server
    function onDrawingEvent(data) {
        let w = canvas.width;
        let h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // make the canvas fill its parent
    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();