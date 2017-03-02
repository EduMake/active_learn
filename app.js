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
var binarydenary = require('./routes/binary-denary');
var binaryhex = require('./routes/binary-hex');
var denarybinarydivision = require('./routes/denary-binary-division');
var denarybinarysubtraction = require('./routes/denary-binary-subtraction');
var hexbinary = require('./routes/hex-binary');


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

/*var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASEURI+"/login/google/return"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile, cb);
    return cb(null, profile);
    //User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //  return cb(err, user);
    //});
  }
));*/

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
  //console.log("accessToken", accessToken, "refresh_token", refresh_token, "params", params, "profile", profile,"waadProfile", waadProfile);
  return cb(null, waadProfile);
  /*  
  // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
  // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
  var waadProfile = profile || jwt.decode(params.id_token);
  
  // this is just an example: here you would provide a model *User* with the function *findOrCreate*
  User.findOrCreate({ id: waadProfile.upn }, function (err, user) {
    done(err, user);
  });*/
  
  
  /*
  family_name: 'Eggleton',
  given_name: 'Martyn',
  ipaddr: '185.24.14.206',
  name: 'Martyn Eggleton',
  oid: '0a61e40f-2eca-48e6-8943-18a857bf66d6',
  onprem_sid: 'S-1-5-21-2984631940-2385209050-2166394264-1214',
  platf: '3',
  sub: 'dW2Zl-vDSSy4_l9oHh3g51wHYmvlx_7ETZEQlQTK1Ss',
  tid: '155de50a-3234-46d8-8e7f-2ec17f586cb2',
  unique_name: 'meggleton@utcsheffield.org.uk',
  
  */
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

app.use('/', index);
app.use('/users', users);
//app.use('/binary-denary', binarydenary);
//app.use('/denary-binary-division', denarybinarydivision);
//app.use('/denary-binary-subtraction', denarybinarysubtraction);
//app.use('/binary-hex', binaryhex);
//app.use('/hex-binary', hexbinary);
app.use('/binary-addition', binaryaddition);

app.locals.nav = [
//    { title :"Binary to Denary", url :"/binary-denary" },
    //{ title :"Denary to Binary ( Division )", url :"/denary-binary-division"},
    //{ title :"Denary to Binary ( Subtraction )", url :"/denary-binary-subtraction"},
    //{ title :"Binary to Hexadecimal", url :"/binary-hex" },
    //{ title :"Hexadecimal to Binary", url :"/hex-binary" },
    { title :"Binary Addition",  url :"/binary-addition" }
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
  
/*app.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/login/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });*/

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
