var express = require('express');
var router = express.Router();
var db = require('../my_modules/database');

/* GET home page. */
router.get('/:id', function(req, res, next) {
    if(!req.session.user){
        res.redirect("/");
    }
    db.getProjectName(req.params.id, function(err, rows){
        console.log(req.params.id);
        console.log(rows[0].name);
        res.render('project', { title: rows[0].name  });
    });
});

module.exports = router;