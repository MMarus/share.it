var express = require('express');
var router = express.Router();
var db = require('../my_modules/database');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user){
      res.redirect("/");
  }
  else{
    var userId = req.session.user.id;
    var user = req.session.user;
    console.log(userId);
    db.getProjects(function(err, rows){
      console.log(rows);
      res.render('drive', { title: 'Pick your project',  rows: rows, user: user});
    });
  }
});

module.exports = router;
