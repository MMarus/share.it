// Connect to the Node.js Server
var name = window.location.pathname.split("/")[2];
var user;

socket = io.connect();

function setUser(id) {
    user = id;
    socket.emit('setUser', id);
    window.location = "drive";
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
    socket.emit('saveProject');
}

