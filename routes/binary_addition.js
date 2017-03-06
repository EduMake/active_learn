var express = require('express');
var router = express.Router();

var exerciseName = 'binary_addition';
/* GET binary_addition page. */
router.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.render(exerciseName, 
      {
          resourceloader: exerciseName, 
          questions:true,
          title: 'Binary Addition Quiz',
          user:req.user, 
          nav:req.app.locals.nav    
      }
    );
  }
);

router.get('/load', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.locals.UserExercise.findOne({
      where:{ 
        user_id: req.user.id,
        exercise: exerciseName
      },
        order: [
          ['id', 'DESC']
        ]
    })
    .then(function(uexercise, created) {
      res.json(uexercise);
      //res.json(JSON.parse(uexercise.state));
    })
    .catch(function(err){
      console.error('binary_addition : load : User Exercise Not Found', err);
    });
  }
);


router.get('/save', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    //console.log("req", req);
    res.locals.UserExercise.findOne({
      where:{ 
        user_id: req.user.id,
        exercise: exerciseName
      },
      order: [
        ['id', 'DESC']
      ]
    }).catch(function(err){
      console.error('binary_addition : findOne : User Exercise findOne failed : ', err);
    })
    .then(function(uexercise) {
        /*if(uexercise.state.length > req.query.state){
          return false;
        }*/
        var oState = JSON.parse(req.query.state);
        console.log("Found", oState);
        //process.exit();
        //var oBody = JSON.parse(req.body);
        console.log("oState",JSON.stringify(oState),"uexercise", JSON.stringify(uexercise));
        var oData = {
          state:  escape(JSON.stringify(oState)),
          maxmark: oState.iMaxMark,
          currentmark: oState.iCurrentMark
        };
        
        if(uexercise){
          return uexercise.update(oData);
        } else {
          oData.user_id = req.user.id;
          oData.exercise = exerciseName;
          return res.locals.UserExercise.create(oData);
        }
        //res.send("done");
        //res.json(JSON.parse(uexercise.state));
    })
    .catch(function(err){
      console.error('binary_addition : save : User Exercise Not Saved : ', err);
    })
    .then(function(uexercise) {
      res.json(uexercise);
      //res.json(JSON.parse(uexercise.state));
    })
    .catch(function(err){
      console.error('binary_addition : save : Response failed : ', err);
    });
  }
);

router.get('/new', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.locals.UserExercise.create({ 
        user_id: req.user.id,
        exercise: exerciseName
    })
    .then(function(uexercise, created) {
        res.json(uexercise);
    })
    .catch(function(err){
      console.error('binary_addition : new : User Exercise Not Created', err);
    });
  }
);

module.exports = router;
