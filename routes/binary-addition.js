var express = require('express');
var router = express.Router();

  
/* GET binary-addition page. */
router.get('/', function(req, res, next) {
    
    require('connect-ensure-login').ensureLoggedIn();

    console.log("res.locals", res.locals, "req.user", req.user);
  res.render('binary-addition', { resourceloader: 'binary-addition', title: 'Binary Addition Quiz' });
});

module.exports = router;
