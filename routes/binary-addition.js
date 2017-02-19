var express = require('express');
var router = express.Router();

/* GET binary-addition page. */
router.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.render('binary-addition', 
        {
            resourceloader: 'binary-addition', 
            questions:true,
            title: 'Binary Addition Quiz',
            user:req.user, 
            nav:req.app.locals.nav    
        });
});

module.exports = router;
