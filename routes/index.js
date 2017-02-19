var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("res.locals", res.locals, "req.user", req.user);
  
  res.render('index', { title: 'Active Learn', user:req.user, nav:req.app.locals.nav});
});


/* GET binary-addition page. */
/*router.get('/', function(req, res, next) {
  res.render('binary-addition', { resourceloader: 'binary-addition', title: 'Binary Addition Quiz' });
});
*/
module.exports = router;
