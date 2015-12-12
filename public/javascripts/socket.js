// Connect to the Node.js Server
var name = window.location.pathname.split("/")[2];

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
}

socket.on('user:connected', function( data ) {
    $( "#usersList").empty();
    var row;
    console.log( "NASLEDUJE FORIIIKK");
    for(row in data){
        console.log(data[row]);
        $( "#usersList").append(
        '<div id="userId' + data[row].id + '" class="row">' +
            '<div class="col-md-1">' +
                '<div style="width: 20px; height: 20px; background-color:'+data[row].color+'"></div>' +
            '</div>'+
            '<div class="col-md-6">' +
                '<p>'+ data[row].name+
            '</div>'+
        '</div>');
    }
});

socket.on('user:disconnected', function( data ) {
    $( "#userId"+data).remove();
});




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