/*window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('draw');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    // Create a Paper.js Path to draw a line into it:
    var path = new paper.Path();
    // Give the stroke a color
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    // Move to start and draw a line from there
    path.moveTo(start);
    // Note that the plus operator on Point objects does not work
    // in JavaScript. Instead, we need to call the add() function:
    path.lineTo(start.add([ 200, -50 ]));
    // Draw the view now:
    paper.view.draw();
}
*/

var name = window.location.pathname.split("/")[2];
//THIS IS ONLY FOR DEBUGING
socket.emit('setUser', {id:1, name: 'marek'});
socket.emit('subscribe', name);

// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger than this
//var tool1 = new Tool();

tool.maxDistance = 50;

socket.on('project:load', function(row) {
    console.log("project:load");
    console.log(row);
    paper.project.activeLayer.remove();
    paper.project.importJSON(row.canvas);

    view.draw();
});


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
    console.log("name befor emit circle="+name);
  // send a 'drawCircle' event with data and sessionId to the server
  socket.emit( 'drawCircle', name, data);

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











