var express = require('express');
var router = express.Router();

/* GET binary_addition page. */
router.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.render('binary_denary', 
        {
            resourceloader: 'binary_denary', 
            questions:true,
            title: 'Binary to Denary Quiz',
            user:req.user, 
            nav:req.app.locals.nav    
        });
});

module.exports = router;
