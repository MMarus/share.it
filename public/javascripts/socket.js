// Connect to the Node.js Server
io = io.connect();

// (1): Send a ping event with
// some data to the server
console.log( "socket: browser says ping (1)" )
io.emit('ping', { some: 'data' } );

// (4): When the browser receives a pong event
// console log a message and the events data
io.on('pong', function (data) {
    console.log( 'socket: browser receives pong (4)', data );
});
