var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('aaa ide session:=');
    console.log(req.session);
    //if(req.app.get('usersList')){
        res.render('index', { title: 'share.it', rows: req.app.get('usersList')});
    //}else
    //res.send("no users wtf ?");
});

module.exports = router;
