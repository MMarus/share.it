var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var projects = require('./my_modules/projects.js');
var project = require('./my_modules/project.js');
var paper = require('paper');

var routes = require('./routes/index');
var users = require('./routes/users');
var routeProject = require('./routes/project');
var drive = require('./routes/drive');
var db = require('./my_modules/database');
var usersList;

//CORS Requests
//var cors = require('cors')

var app = express();

//app.use(cors());

//Socket.io import
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.getUsers(function (err, rows) {
    app.set('usersList', rows);
});
usersList = app.get('usersList');


//Application routes
app.use('/', routes);
//select user, who you want to be
app.use('/users', users);

app.use('/drive', drive);

app.use('/project', routeProject);
//Selection of the document
//app.use('/document', document);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

/*Socket.io*/
// A user connects to the server (opens a socket)
app.io.sockets.on('connection', function (socket) {

    //The server recieves a setUser event
    // from the browser on this socket
    socket.on('setUser', function (data) {
        socket.user = data;
        console.log('socket nastav user=' + data);
    });

    socket.on('subscribe', function (data) {
        console.log("Subscribe:" + data);
        subscribe(socket, data);
    });


    socket.on('disconnect', function () {
        console.log("User disconnected");
        // TODO: We should have logic here to remove a drawing from memory as we did previously
    });

    socket.on('saveProject', function () {
        console.log("You wanna save the project !!!");
        //console.log(projects.projects[room]);
        //zavolat db save
    });

    socket.on('createProject', function (name) {
        console.log("Creating new project " + name);
        createProject(socket, name);
    });

    // User joins a room


    socket.on('drawCircle', function (data, session) {
        socket.broadcast.emit('drawCircle', data);
    })


});

function createProject(socket, name) {
    projects.projects[name] = {};
    console.log(projects.projects);
    console.log(paper.Project());

    //projects[name].project = new paper.Project();
    //socket.join(name);

    //project.loadProject(name);

    //pouzi nejaku funkciu ktora nacita project do canvasu
    //app.io.to(name).emit('user:connect', roomUserCount);

}

// Subscribe a client to a room
function subscribe(socket, data) {
    var room = data.project;
    var user = data.user;
    console.log("user="+user);


    // Subscribe the client to the room
    socket.join(room);

    // If the close timer is set, cancel it
    // if (closeTimer[room]) {
    //  clearTimeout(closeTimer[room]);
    // }

    // Create Paperjs instance for this room if it doesn't exist
    var project = projects.projects[room];
    console.log(project);

    if (!project) {
        console.log("made room");
        projects.projects[room] = {};
        // Use the view from the default project. This project is the default
        // one created when paper is instantiated. Nothing is ever written to
        // this project as each room has its own project. We share the View
        // object but that just helps it "draw" stuff to the invisible server
        // canvas.
        db.getProject(room, function(err, rows){
            projects.projects[room] = {"project" : rows[0].canvas};
            console.log(projects.projects[room].project);
        });
    } else { // Project exists in memory, no need to load from database
        console.log(projects.projects[room].project);
    }
    app.io.to(room).emit('user:connect', user);
    /*projects.projects[room].project = new paper.Project();
     projects.projects[room].external_paths = {};

     } else { // Project exists in memory, no need to load from database
     loadFromMemory(room, socket);
     }

     // Broadcast to room the new user count -- currently broken
     var rooms = socket.adapter.rooms[room];
     var roomUserCount = Object.keys(rooms).length;
     app.io.to(room).emit('user:connect', roomUserCount);
     */
}

// Send current project to new client
function loadFromMemory(room, socket) {
    var project = projects.projects[room].project;
    if (!project) { // Additional backup check, just in case
        db.load(room, socket);
        return;
    }
    socket.emit('loading:start');
    var value = project.exportJSON();
    socket.emit('project:load', {project: value});
//  socket.emit('settings', clientSettings);
    socket.emit('loading:end');
}

function loadError(socket) {
    socket.emit('project:load:error');
}
