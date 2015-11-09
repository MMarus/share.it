var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'share.it', rows: req.app.get('usersList')});
});

module.exports = router;
