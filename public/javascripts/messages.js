var messages = [];


$(document).ready(function(){
    $('#newMessage').keypress(function(e) {
        if (e.which == 13) sendMessage();
    });
});

function sendMessage () {
    var message = $("#newMessage").val();
    console.log("sending message = " + message);
    // Prevent markup from being injected into the message
    message = cleanInput(message);

    // if there is a non-empty message and a socket connection
    if (message) {
        $("#newMessage").val('');
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', message);
    }
}

function cleanInput (input) {
    return $('<div/>').text(input).text();
}

socket.on('new message', function (data) {
    console.log("got new message");
    console.log(data);
    addChatMessage(data);
});

function addChatMessage(data) {
    messages.push(addChatMessage);
    $("#chat").append('<li class="collection-item">'+data.username+': '+data.message+'</li>');
}

