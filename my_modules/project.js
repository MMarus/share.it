var projects = require('./projects.js');
var db = require('./database.js');
var paper = require('paper');

projects = projects.projects;

// Create an in memory paper canvas
//TODO: pohraj sa s velkostou canvasu
var drawing = paper.setup(new paper.Canvas(1920, 1080));

exports.drawInternal = function (room, data) {
    var project = projects[room].project;
    project.activate();

    drawCircle( data.x, data.y, data.radius, data.color );


    project.view.draw();
    db.storeProject(room);
}

function drawCircle( x, y, radius, color ) {

    // Render the circle with Paper.js
    var circle = new drawing.Path.Circle( new drawing.Point( x, y ), radius );
    circle.fillColor = new drawing.Color('rgb', color.red, color.green, color.blue, color.alpha );

    // Refresh the view, so we always get an update, even if the tab is not in focus
    //view.draw();
}

