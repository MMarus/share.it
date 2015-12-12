//Using mysql nodejs module.
//Docs: https://www.npmjs.com/package/mysql
/* 
 var mysql      = require('mysql');
 var connection = mysql.createConnection({
 host     : 'http://db55.websupport.sk/',
 user     : 'shareit',
 password : 'Toj*Oskit4',
 database : 'shareit'
 });

 //Connect to database
 connection.connect(function(err) {
 if (err) {
 console.error('error connecting: ' + err.stack);
 return;
 }

 console.log('connected as id ' + connection.threadId);
 });


 connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
 if (err) throw err;
 console.log('The solution is: ', rows[0].solution);
 });

 connection.end();
 */


//mysql using pool from: http://stackoverflow.com/questions/16800418/how-to-properly-pass-mysql-connection-to-routes-with-express-js
var mysql = require('mysql');
var projects = require('./projects.js');

var pool = mysql.createPool({
    host: '195.210.29.44',
    user: 'shareit',
    password: 'Toj*Oskit4',
    database: 'shareit',
    port: '3310',
    connectionLimit: 10,
});

// Get records from a city
exports.getUsers = function (callback) {
    var sql = "SELECT * FROM user";
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log("COLUD NOT CONNECT TO DATABASE");
            console.log(err);
            callback(true);
            return;
        }
        // make the query
        connection.query(sql, function (err, results) {
            console.log(results);
            connection.release();
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, results);
        });
    });
};

exports.getProjectName = function (id, callback) {
    var sql = "SELECT id, name FROM project WHERE id = "+id;
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        // make the query
        connection.query(sql, function (err, results) {
            connection.release();
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, results);
        });
    });
};

exports.getProjects = function (callback) {
    var sql = "SELECT id, name FROM project";
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        // make the query
        connection.query(sql, function (err, results) {
            connection.release();
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, results);
        });
    });
};

exports.getProjectsByUser = function (userId, callback) {
    var sql = "SELECT id, name FROM project where id =" + userId;
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        // make the query
        connection.query(sql, function (err, results) {
            connection.release();
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, results);
        });
    });
};

exports.getProject = function (id, callback) {
    var sql = "SELECT * FROM project WHERE id="+id;
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(true);
            return;
        }
        // make the query
        connection.query(sql, function (err, results) {
            connection.release();
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            callback(false, results);
        });
    });
};

exports.storeProject = function (room) {
    var project = projects.projects[room].project;
    //console.log(project);
    var json = project.exportJSON();
    if(json.length > 65000){
        console.log("WARNING TOO FILE TOO BIG");
        json = "[]";
    }

    //console.log(json);
    console.log("Writing project to database");

    var sql = "UPDATE project SET canvas='"+json+"' WHERE id='"+room + "'";
    // get a connection from the pool
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        // make the query
        connection.query(sql, function (err) {
            connection.release();
            if (err) {
                console.log(err);
                return;
            }
        });
    });
};

// Try to load room from database
exports.load = function (room, socket) {
    console.log("load from db");
    /*
     var sql = "SELECT * FROM project WHERE id=???";
     if (projects.projects[room] && projects.projects[room].project) {
     var project = projects.projects[room].project;
     db.get(room, function(err, value) {
     if (value && project && project.activeLayer) {
     socket.emit('loading:start');
     // Clear default layer as importing JSON adds a new layer.
     // We want the project to always only have one layer.
     project.activeLayer.remove();
     project.importJSON(value.project);
     socket.emit('project:load', value);
     }
     socket.emit('loading:end');
     });
     socket.emit('loading:end'); // used for sending back a blank database in case we try to load from DB but no project exists
     } else {
     loadError(socket);
     }*/
}