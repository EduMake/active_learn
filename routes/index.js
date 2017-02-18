var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Active Learn' });
});


/* GET binary-addition page. */
/*router.get('/', function(req, res, next) {
  res.render('binary-addition', { resourceloader: 'binary-addition', title: 'Binary Addition Quiz' });
});
*/
module.exports = router;
