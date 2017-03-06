var express = require('express');
var router = express.Router();

/* GET binary_addition page. */
router.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.render('denary_binary_subtraction', 
        {
            //resourceloader: 'binary_denary', 
            questions:true,
            title: 'Denary to Binary (Subtraction method) Quiz',
            user:req.user, 
            nav:req.app.locals.nav    
        });
});

module.exports = router;
