var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log("res.locals", res.locals, "req.user", req.user);
  res.render('index', 
  { 
    title: 'Welcome to Active Learn', 
    user:req.user, 
    nav:req.app.locals.nav
    
  });
});

module.exports = router;
