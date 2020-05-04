'use strict';

(function () {

    let socket = io();
    let canvas = document.getElementsByClassName('whiteboard')[0];
    let context = canvas.getContext('2d');

    const states = {
        "START_MENU": "startmenu",
        "GAME": "game"
    }

    let state = states.START_MENU;

    let current = {
        color: 'black'
    };

    let drawing = false;

    //find ready to play button and listen for click
    let playForm = document.getElementById('form');
    playForm.addEventListener('submit', playerReady);

    function playerReady(e){
        e.preventDefault(); //stop page refresh
        //get value of input box
        let playerName = document.getElementById("n").value;
        
        //add player to room?

        //show waiting box
        
 
    }









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
        context.lineWidth = 10;
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
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    }

    function onMouseMove(e) {
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
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