// Connect to the Node.js Server
var name = window.location.pathname.split("/")[2];
var user;

socket = io.connect();

function setUser(data) {
    socket.emit('setUser', data);
    window.location = "drive/";
}


function openProject(project) {
    window.location = "/project/"+project;

    //var canvas = document.getElementById('draw');
    //paper.setup(canvas);
    //console.log(paper.paperScope.project);

    socket.emit('subscribe', {"project":project, "user":user});
}

socket.on('user:connect', function( data ) {
    console.log( 'User connected:'+ data );
})





/*
 // (1): Send a ping event with
 // some data to the server
 console.log( "socket: browser says ping (1)" )
 socket.emit('ping', { some: 'data' } );

 // (4): When the browser receives a pong event
 // console log a message and the events data
 socket.on('pong', function (data) {
 console.log( 'socket: browser receives pong (4)', data );
 });*/


function saveProject() {
    socket.emit('saveProject', name);
}










// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger than this
tool.maxDistance = 50;


// Returns an object specifying a semi-random color
// The color will always have a red value of 0
// and will be semi-transparent (the alpha value)
function randomColor() {

    return {
        red: 0,
        green: Math.random(),
        blue: Math.random(),
        alpha: ( Math.random() * 0.25 ) + 0.05
    };

}

// every time the user drags their mouse
// this function will be executed
function onMouseDrag(event) {

    // Take the click/touch position as the centre of our circle
    var x = event.middlePoint.x;
    var y = event.middlePoint.y;

    // The faster the movement, the bigger the circle
    var radius = event.delta.length / 2;

    // Generate our random color
    var color = randomColor();

    // Draw the circle
    drawCircle( x, y, radius, color );

    // Pass the data for this circle
    // to a special function for later
    emitCircle( x, y, radius, color );

}


function drawCircle( x, y, radius, color ) {

    // Render the circle with Paper.js
    var circle = new Path.Circle( new Point( x, y ), radius );
    circle.fillColor = new Color('rgb', color.red, color.green, color.blue, color.alpha );

    // Refresh the view, so we always get an update, even if the tab is not in focus
    view.draw();
}


// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitCircle( x, y, radius, color ) {


    // Each Socket.IO connection has a unique session id
    //var sessionId = socket.socket.sessionid;

    // An object to describe the circle's draw data
    var data = {
        x: x,
        y: y,
        radius: radius,
        color: color
    };

    // send a 'drawCircle' event with data and sessionId to the server
    socket.emit( 'drawCircle', data)

    // Lets have a look at the data we're sending
    console.log( data )

}


// Listen for 'drawCircle' events
// created by other users
socket.on( 'drawCircle', function( data ) {

    console.log( 'drawCircle event recieved:', data );

    // Draw the circle using the data sent
    // from another user
    drawCircle( data.x, data.y, data.radius, data.color );

})
