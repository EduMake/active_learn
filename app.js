var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// TODO : look at logging settings https://www.npmjs.com/package/morgan 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var binary_addition = require('./routes/binary_addition');
var binary_denary = require('./routes/binary_denary');
var binary_hex = require('./routes/binary_hex');
var denary_binary_division = require('./routes/denary_binary_division');
var denary_binary_subtraction = require('./routes/denary_binary_subtraction');
var hex_binary = require('./routes/hex_binary');

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var Sequelize = require('sequelize');
var DB = new Sequelize('active_learn', 'edumake', '9d8m7k6', {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: 'active_learn.sqlite'
});

DB
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Stopping : Unable to connect to the database:', err);
    process.exit();
  });

var User = DB.define('user', {
  id:{
    type: Sequelize.INTEGER, 
    autoIncrement: true,
    primaryKey: true
  },
  login: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
    validate:{isEmail: true,}
  },
  role: {
    type: Sequelize.STRING,
    defaultValue: 'student',
    allowNull: false,
  },
});
// TODO : catching user create errors inside passort to pass as 500 errors.

var UserExercise = DB.define('userexercise', {
  id:{
    type:Sequelize.INTEGER ,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
   }
  },
  exercise: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  state: {
    type: Sequelize.STRING,
    defaultValue:"{}"
    //allowNull: false,
  },
  currentmark:{
    type:Sequelize.INTEGER ,
    allowNull: true,
    defaultValue:0
  },
  maxmark:{
    type:Sequelize.INTEGER ,
    allowNull: true,
    defaultValue:0
  }
});


var bCreateWithForce = false;
User.sync({force: bCreateWithForce})
  .then(function(){
    return User.findOrCreate({
      where:{ 
        login: process.env.ADMIN_EMAIL 
      },
      defaults: {
        email: process.env.ADMIN_EMAIL,
        name: process.env.ADMIN_NAME,
        role: 'teacher'
      }
    });
  })
  .then(function(){
    UserExercise.sync({force: bCreateWithForce});
  });
  
  
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.BASEURI+"/login/github/return"
  },
  function(accessToken, refreshToken, profile, cb) {
    var login = profile._json.email|| profile.username;
    var name = profile.username || profile.username;
    
    User.findOrCreate({where:{ "login": login },
      defaults: {name: name}})
      .spread(function(user, created) {
          cb(null, user);
      })
      .catch(function(err){
        console.error('User Not Created', err);
      });
    
  }
));

var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
var jwt = require('jsonwebtoken');

passport.use(new AzureAdOAuth2Strategy({
  clientID: process.env.SUTC_CLIENT_ID,
  clientSecret: process.env.SUTC_CLIENT_SECRET,
  callbackURL: process.env.BASEURI+"/login/sutc/return",
  resource:process.env.SUTC_CLIENT_ID//SUTC_OBJECT_ID,
},
function (accessToken, refresh_token, params, profile, cb) {
  var waadProfile = jwt.decode(params.id_token, '', true);
  User.findOrCreate({where:{ login: waadProfile.upn },
    defaults: {
        email: waadProfile.upn ,
        name: waadProfile.name
      }})
    .spread(function(user, created) {
        cb(null, user);
    })
    .catch(function(err){
      console.error('User Not Created', err);
    });
  
}));

// TODO : Add school auth using https://github.com/QuePort/passport-sharepoint  

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('raw-helper', function(options) {
  return options.fn();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({ secret: process.env.SESSIONSECRET, resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

var epilogue = require('epilogue');
// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: DB
});

// Create REST resource
var userExerciseResource = epilogue.resource({
  model: UserExercise,
  endpoints: ['/userexercise', '/userexercise/:id']
});

app.use(function(req, res, next){
  res.locals.UserExercise = UserExercise;
  next();
});


app.use('/', index);
app.use('/users', users);
//app.use('/binary_denary', binary_denary);
//app.use('/denary_binary_division', denary_binary_division);
//app.use('/denary_binary_subtraction', denary_binary_subtraction);
//app.use('/binary_hex', binary_hex);
//app.use('/hex-binary', hex_binary);
app.use('/binary_addition', binary_addition);

app.locals.nav = [
//    { title :"Binary to Denary", url :"/binary_denary" },
    //{ title :"Denary to Binary ( Division )", url :"/denary_binary_division"},
    //{ title :"Denary to Binary ( Subtraction )", url :"/denary_binary_subtraction"},
    //{ title :"Binary to Hexadecimal", url :"/binary_hex" },
    //{ title :"Hexadecimal to Binary", url :"/hex-binary" },
    { title :"Binary Addition",  url :"/binary_addition" }
  ];

app.get('/privacy',
  function(req, res){
    res.render('privacy');
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/login/github',
  passport.authenticate('github'));

app.get('/login/github/return', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/login/sutc',
  passport.authenticate('azure_ad_oauth2'),
  function(req, res){
    // The request will be redirected to SharePoint for authentication, so
    // this function will not be called.
  });

app.get('/login/sutc/return', 
  passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.error("Error: ", err);
  
  //console.error("Shutting Down due to: ", err);
  //process.exit();
});

module.exports = app;
