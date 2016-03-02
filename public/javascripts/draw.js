
var toolsColor = "black";
var width = 10;
var projectName = window.location.pathname.split("/")[2];
var userColor = "black";

socket.emit('getUserColor');
socket.on('setUserColor', function(color) {
    userColor = color;
})

//TODO: DRAG TOOL EMITTING

$('.slider').slider()
    .on('slideStop', function(ev){
        width = ev.value;
    });

//COLOR PICKING
$("#full-color-picker").spectrum({
    replacerClassName: 'btn btn-sm btn-default',
    color: "black",
    showInput: true,
    className: "full-spectrum",
    showInitial: true,
    showPalette: true,
    showSelectionPalette: true,
    maxSelectionSize: 10,
    preferredFormat: "hex",
    localStorageKey: "spectrum.demo",
    move: function (color) {
    },
    show: function () {
    },
    beforeShow: function () {
    },
    hide: function () {
    },
    change: function(color) {
        console.log(color);
        setColor(color.toHexString());
    },
    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
            "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ]
});

function setColor(color) {
    toolsColor = color;
}

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


// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger than this
//var tool1 = new Tool();



socket.on('project:load', function(row) {
    console.log("project:load");
    console.log(row);
    paper.project.activeLayer.remove();
    paper.project.importJSON(row.canvas);

    view.draw();
});

/////////////////////CIRCLES DRAWING//////////////////
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

var circlesTool = new Tool();
circlesTool.maxDistance = 50;
// every time the user drags their mouse
// this function will be executed
circlesTool.onMouseDrag = function (event) {

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

});
/////////////////////CIRCLES DRAWING//////////////////


//////////////////////LINE TOOOL///////////////////////

var lineTool = new Tool();

lineTool.NewColor = function(){
    farba = new Color(1, 0, 0);
};

lineTool.onMouseDown = function(event){
    from = event.point;
};

lineTool.onMouseUp = function(event){
    to = event.point;

    drawLine(from.x, from.y , to.x, to.y, toolsColor, width );
    emitLine(from.x, from.y , to.x, to.y, toolsColor, width );
};


function drawLine( x1, y1, x2, y2, color, width ) {
    var from = new Point(x1,y1);
    var to = new Point(x2,y2);

    var line1 = new Path.Line(from, to);
    line1.strokeColor = color;
    line1.strokeWidth = width;

    // Refresh the view, so we always get an update, even if the tab is not in focus
    view.draw();
}

//lineTool.activate();


// This function sends the data for a circle to the server
// so that the server can broadcast it to every other user
function emitLine( x1, y1, x2, y2, color, width ) {


    // Each Socket.IO connection has a unique session id
    //var sessionId = socket.socket.sessionid;

    // An object to describe the circle's draw data
    var data = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        color: color,
        width: width
    };
    console.log( data );
    console.log("name befor emit circle="+name);
    // send a 'drawCircle' event with data and sessionId to the server
    socket.emit( 'drawLine', name, data);

    // Lets have a look at the data we're sending


}


// Listen for 'drawCircle' events
// created by other users
socket.on( 'drawLine', function( data ) {

    // Draw the circle using the data sent
    // from another user
    drawLine( data.x1, data.y1, data.x2, data.y2, data.color, data.width );

});
//////////////////////LINE TOOOL///////////////////////


//////////curve TOOL////////////////
var curveTool = new Tool();

var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};

curveTool.onMouseMove = function(event) {
    var hitResult = project.hitTest(event.point, hitOptions);
    project.activeLayer.selected = false;
    if (hitResult && hitResult.item){
        document.body.style.cursor="move";
        hitResult.item.selected = true;
    }
    else{
        document.body.style.cursor="default";
    }

};

curveTool.onMouseDown = function(event) {
    segment = path = null;
    var hitResult = project.hitTest(event.point, hitOptions);

    if (event.modifiers.shift) {
        if (hitResult.type == 'segment') {
            hitResult.segment.remove();
        };
        return;
    }

    if (hitResult) {
        path = hitResult.item;
        if (hitResult.type == 'segment') {
            segment = hitResult.segment;
        } else if (hitResult.type == 'stroke') {
            var location = hitResult.location;
            segment = path.insert(location.index + 1, event.point);
            path.smooth();
        }
        hitResult.item.bringToFront();
    }
};

curveTool.onMouseDrag = function(event) {
    document.body.style.cursor="move";
    if (segment) {
        segment.point += event.delta;
        path.smooth();
    } else if (path) {
        path.position += event.delta;
    }
};

curveTool.onMouseUp = function(event){
    document.body.style.cursor="default";
};



//CURVE TOOL/////


//DRAG TOOOL///
var dragTool = new Tool();

dragTool.onMouseMove = function(event) {
    var hitResult = project.hitTest(event.point, hitOptions);
    //project.activeLayer.selected = false;
    if (hitResult && hitResult.item){
        document.body.style.cursor="move";
        //hitResult.item.selected = true;
        //hitResult.item.bounds.selected = true;

    }
    else{
        document.body.style.cursor="default";
    }

};

//Treba definovat pred pristupom
var pathLocal;
var pathsRemote = {};

dragTool.onMouseDown = function(event) {
    console.log("ON click POINT");
    console.log(event.point);
    selectItemLocal(event.point.x, event.point.y);
};

function selectItemLocal(x, y){
    var row;
    var point = new Point(x, y);

    if(pathLocal && pathLocal.bounds && pathLocal.bounds.selected == true)
        pathLocal.bounds.selected = false;
    pathLocal = null;

    var hitResult = project.hitTest(point, hitOptions);


    if (hitResult && hitResult.item) {
        //Treba pozret ci neni uz selektnute niekym inym
        for(row in pathsRemote){
            console.log("POROVNAVAM CI SU ROVNAKE VOLADE");
            console.log(pathsRemote[row].id);
            console.log(hitResult.item.id);
            if(pathsRemote[row].id == hitResult.item.id){
                console.log("AJAJAJAJ SU ROVNAKE ");
                return;
            }
        }

        pathLocal = hitResult.item;
        hitResult.item.bounds.selected = true;
        //console.log(socket);
        hitResult.item.selectedColor = userColor;

        pathLocal.smooth();
    }
    socket.emit('selectItem', {x: x, y: y});

}

socket.on( 'selectItemRemote', function( data, socketId, color ) {
//treba ak neexistuje nic a socketID nech sa resetne aj v poli data
    if(socket.id != socketId){
        console.log(data);

        if(pathsRemote[socketId]){
            console.log("TAAAAAAAAAAAAATO SOCKETID UZ EXISTUJEEEE");
            //IF NENI TA ISTA PATH?
            pathsRemote[socketId].bounds.selected = false;
            //UNSELECT PREDOSLU
        }
        else{
            console.log("NEEEEEEEEEXISTUJEEEE SOCKETID CESTA ");
        }

        var point = new Point(data.x, data.y);

        var hitResult = project.hitTest(point, hitOptions);
        if (hitResult && hitResult.item) {
            console.log("SELECTUJEME CIARKU");
            pathsRemote[socketId] = hitResult.item;

            hitResult.item.bounds.selected = true;
            hitResult.item.selectedColor = color;

            console.log(hitResult.item.bounds);
            pathsRemote[socketId].smooth();
        }
        view.draw();
    }
});

dragTool.onMouseDrag = function(event) {
    dragItemLocal(event.delta.x, event.delta.y);
};

function dragItemLocal(x, y){
    var point = new Point(x, y);
    if(pathLocal){
        document.body.style.cursor="move";
        pathLocal.position += point;
        socket.emit('dragItem', {x: x, y: y, id: pathLocal.id});
    }
}

dragTool.activate();

socket.on( 'dragItemRemote', function( data, socketId ) {
    var point = new Point(data.x, data.y);
    if(pathsRemote[socketId]){
        pathsRemote[socketId].position += point;
    }
    view.draw();
});

////////////////////////DRAG TOOL////


//Activation of tools with buttons
$(document).ready(function(){
    $('#setLine').click(function(){
        lineTool.activate();
    });
});

$(document).ready(function(){
    $('#setCircles').click(function(){
        circlesTool.activate();
    });
});

$(document).ready(function(){
    socket.emit('subscribe', projectName);
    socket.emit('getUserColor', projectName);

    $('#saveProject').click(function(){
        console.log("SAVING PROJECT");
        socket.emit('saveProject');
    });

});

$(document).ready(function(){
    $('#dragTool').click(function(e){
        dragTool.activate();
    });
});

$(document).ready(function(){
    $('#curveTool').click(function(e){
        curveTool.activate();
    });
});


//TODO:
//Pri subscribe poslat ID socketu a ulozit ho ako global identifikator
//