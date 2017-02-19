var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// TODO : look at logging settings https://www.npmjs.com/package/morgan 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var binaryaddition = require('./routes/binary-addition');

var Datastore = require('nedb');
var UserStore = new Datastore({ filename: 'User.db', autoload: true });

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.BASEURI+"/login/github/return"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile, cb);
    return cb(null, profile);
    /*User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });*/
  }
));


var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASEURI+"/login/google/return"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile, cb);
    return cb(null, profile);
    /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });*/
  }
));

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

app.use('/', index);
app.use('/users', users);
app.use('/binary-addition', binaryaddition);

app.locals.nav = [
    {
      title :"Binary Addition",
      url   :"/binary-addition"
    }
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


app.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/login/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
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
});

module.exports = app;
