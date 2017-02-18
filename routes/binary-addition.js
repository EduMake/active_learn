var express = require('express');
var router = express.Router();

require('connect-ensure-login').ensureLoggedIn(),
  
/* GET binary-addition page. */
router.get('/', function(req, res, next) {
  res.render('binary-addition', { resourceloader: 'binary-addition', title: 'Binary Addition Quiz' });
});

module.exports = router;
