var express = require('express');
var router = express.Router();
var db = require('../my_modules/database');


/* GET home page. */
router.post('/', function(req, res, next) {
  req.checkBody('projectName', 'Invalid project name!').isAlpha();
  req.sanitizeBody('projectName').escape();
  var errors = req.validationErrors();
  if(errors === false) {
    var name = req.body.projectName;
    db.createProject(name);
    res.redirect("/project/"+name);
  }

  if(!req.session.user){
      res.redirect("/");
  }
  else{
    var userId = req.session.user.id;
    var user = req.session.user;
    console.log(userId);
    db.getProjects(function(err, rows){
      console.log(rows);
      res.render('drive', { title: 'Pick your project',  rows: rows, user: user, errors: errors});
    });
  }
});

router.get('/', function(req, res, next) {
  var errors = false;
  if(!req.session.user){
      res.redirect("/");
  }
  else{
      var userId = req.session.user.id;
      var user = req.session.user;
      console.log(userId);
      db.getProjects(function(err, rows){
          console.log(rows);
          res.render('drive', { title: 'Pick your project',  rows: rows, user: user, errors: errors});
      });
  }
});

module.exports = router;
