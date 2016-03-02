var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var projects = require('./my_modules/projects.js').projects;
var project = require('./my_modules/project.js');
var paper = require('paper');
var uuid = require('uuid');

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
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//pri vecsom pocte uzivatelov, neukladat premennu do pameti
db.getUsers(function (err, rows) {
    console.log('logging users');
    console.log(rows);

    app.set('usersList', rows);
});
usersList = app.get('usersList');


//session
/*
app.use(session({secret: 'secret', key: 'express.sid'})); */
var SESSION_SECRET = 'keyboard cat';
var MemoryStore = session.MemoryStore;
sessionStore = new MemoryStore();

var sessionMiddleware = session({store: sessionStore, genid: function(req) {
        return uuid.v4() // use UUIDs for session IDs
    },
    secret: SESSION_SECRET
});
app.use(sessionMiddleware);
//Use session in Sockets
app.io.use(function(socket, next){
    sessionMiddleware(socket.request, socket.request.res, next);
});


//Application routes
app.use('/', routes);
//select user, who you want to be
app.use('/users', users);
app.use('/drive', drive);
app.use('/project', routeProject);

/*
app.get('/project/*', function (req, res) {
    res.render('project', { title: 'Project' });
});*/

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

// A user connects to the server (opens a socket)
app.io.sockets.on('connection', function (socket) {
    var hs = socket.request;
    console.log('A socket with sessionID ' + hs.sessionID + ' connected!');
    console.log(socket.id);

    //The server recieves a setUser event
    // from the browser on this socket
    socket.on('setUser', function (data) {
        console.log("SETTTTINGGGG USER")
        console.log(data);
        hs.session.user = data;
        hs.session.save();
        socket.userId = data.id;
    });

    socket.on('subscribe', function (data) {
        subscribe(socket, data);
        socket.room = data;
    });

     socket.on('createProject', function (name) {
        console.log("Creating new project " + name);
        createProject(socket, name);
    });

    // User joins a room


    socket.on('drawCircle', function (room, data) {
        project.drawInternal(room, data, 'drawCircle');
        socket.broadcast.to(room).emit('drawCircle', data);
    });

    socket.on('drawLine', function (room, data) {
        project.drawInternal(room, data, 'drawLine');
        socket.broadcast.to(room).emit('drawLine', data);

    });

    socket.on('getUserColor', function(){
        console.log("DAJ MI FARBU UZIVATELA");
        app.io.to(socket.id).emit('setUserColor', hs.session.user.color);
    });



    socket.on('selectItem', function (data) {
        socket.broadcast.to(socket.room).emit('selectItemRemote', data, socket.id, hs.session.user.color);
        data.socketId = socket.id;
        project.drawInternal(socket.room, data, 'selectItem');
    });

    socket.on('dragItem', function(data){
        socket.broadcast.to(socket.room).emit('dragItemRemote', data, socket.id);
        data.socketId = socket.id;
        project.drawInternal(socket.room, data, 'dragItem');
    });



    socket.on('disconnect', function () {
        unsubscribe(socket);
    });

    socket.on('saveProject', function(){
        project.saveProject(socket.room);
    });
});

function unsubscribe(socket){
    console.log("ODPAAAAAAAAAAAAAAJAAAAAAA SAAAAAAA USER ");
    if(socket.room != null){
        console.log("ODPAAAAAAAAAAAAAAJAAAAAAA SAAAAAAA USER ");
        var user = socket.request.session.user.id;
        console.log(user);
        console.log(projects[socket.room].users);
        delete projects[socket.room].users[user];
        socket.leave(socket.room);
        app.io.to(socket.room).emit('user:disconnected', socket.request.session.user.id);
    }
}

function createProject(socket, name) {
    projects[name] = {};
    console.log(projects);
    console.log(paper.Project());

    //projects[name].project = new paper.Project();
    //socket.join(name);

    //project.loadProject(name);

    //pouzi nejaku funkciu ktora nacita project do canvasu
    //app.io.to(name).emit('user:connect', roomUserCount);

}

// Subscribe a client to a room
function subscribe(socket, room) {
    var user = socket.request.session.user;
    console.log(user);
    console.log("SUBSCRIBING ="+user.name);


    // Subscribe the client to the room
    socket.join(room);

    // If the close timer is set, cancel it
    // if (closeTimer[room]) {
    //  clearTimeout(closeTimer[room]);
    // }

    // Create Paperjs instance for this room if it doesn't exist

    if (!projects[room]) {
        console.log("made room");
        projects[room] = {};
        projects[room].users = {};
        // Use the view from the default project. This project is the default
        // one created when paper is instantiated. Nothing is ever written to
        // this project as each room has its own project. We share the View
        // object but that just helps it "draw" stuff to the invisible server
        // canvas.

        projects[room].project = new paper.Project();
        console.log(projects[room].project);
        projects[room].external_paths = {};
        db.getProject(room, function(err, rows){
            if(rows.length != 1){
                console.log("could not find the project");
            }
            else if(rows.length == 1 && projects[room].project && projects[room].project.activeLayer){
                console.log('Mame projekt z db, ukladame ho do projektu');
                if(projects[room].project.activeLayer)
                    projects[room].project.activeLayer.remove();

                //TODO: upravit
                projects[room].project.id = rows[0].id;
                //console.log(rows[0]);
                projects[room].project.importJSON(rows[0].canvas);
                socket.emit('project:load', rows[0]);
            }
            else{
                console.log("error during loading project from DB");
            }
            //console.log(projects[room].project);
        });
    } else { // Project exists in memory, no need to load from database
        console.log('Project exists in memory, no need to load from database');
        loadFromMemory(room, socket);
    }

    projects[room].users[user.id] = user;
    console.log("PRIPAAAAAAAAAAAAAJA SA USER");
    console.log(projects[room].users);
    app.io.to(room).emit('user:connected', projects[room].users, user);
}

// Send current project to new client
function loadFromMemory(room, socket) {
    var project = projects[room].project;
    if (!project) { // Additional backup check, just in case
        db.getProject(room, function(err, rows){
            if(rows.length != 1){
                console.log("could not find the project");
            }
            else if(rows == 1 && project.project && project.project.activeLayer){
                console.log('Mame projekt z db, ukladame ho do projektu');
                project.project.activeLayer.remove();
                //console.log(rows[0]);
                //TODO: upravit
                //project.id = rows[0].id;
                project.project.importJSON(rows[0].canvas);
                socket.emit('project:load', rows[0]);
            }
            //console.log(projects[room].project);
        });
        return;
    }
    console.log('import from the memory');
    var canvas = project.exportJSON();
    socket.emit('project:load', {canvas: canvas});
}

function loadError(socket) {
    socket.emit('project:load:error');
}
