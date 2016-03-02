var projects = require('./projects.js');
var db = require('./database.js');
var paper = require('paper');

projects = projects.projects;

// Create an in memory paper canvas
//TODO: pohraj sa s velkostou canvasu
var drawing = paper.setup(new paper.Canvas(1920, 1080));

exports.drawInternal = function (room, data, func) {
    var project = projects[room].project;
    project.activate();
    //console.log(data);

    switch(func) {
        case "drawLine":
            drawLine( data.x1, data.y1, data.x2, data.y2, data.color, data.width );
            break;
        case "drawCircle":
            drawCircle( data.x, data.y, data.radius, data.color );
            break;
        case "dragItem":
            dragItem( data.x, data.y, data.socketId);
            break;
        case "selectItem":
            selectItem( data.x, data.y, data.socketId);
            break;
        default:
            console.log("EROOOOOOOOOOOOR ZLA FUNKCiA");
    }


    project.view.draw();
};

exports.saveProject = function (room) {
    db.storeProject(room);
}



function drawCircle( x, y, radius, color ) {

    // Render the circle with Paper.js
    var circle = new drawing.Path.Circle( new drawing.Point( x, y ), radius );
    circle.fillColor = new drawing.Color('rgb', color.red, color.green, color.blue, color.alpha );

    // Refresh the view, so we always get an update, even if the tab is not in focus
    //view.draw();
}

function drawLine( x1, y1, x2, y2, color, width ) {
    var from = new drawing.Point(x1,y1);
    var to = new drawing.Point(x2,y2);

    var line1 = new drawing.Path.Line(from, to);
    line1.strokeColor = color;
    line1.strokeWidth = width;

    // Refresh the view, so we always get an update, even if the tab is not in focus
    //view.draw();
}



var pathsRemote = {};
var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 5
};

function dragItem(x, y, socketId){

    if(pathsRemote[socketId]){
        pathsRemote[socketId].position.x += x;
        pathsRemote[socketId].position.y += y;
    }
}

function selectItem(x, y, socketId){

    var point = new drawing.Point(x, y);

    var hitResult = drawing.project.hitTest(point, hitOptions);
    if (hitResult && hitResult.item) {
        pathsRemote[socketId] = hitResult.item;
    }
}