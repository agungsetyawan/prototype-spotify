var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var dotenv = require('dotenv');
var SpotifyStrategy = require('passport-spotify').Strategy;
var result = dotenv.config();

if (result.error) {
  throw result.error;
}
console.log(result.parsed);

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var callbackRouter = require('./routes/callback');
var refreshTokenRouter = require('./routes/refresh_token');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/callback', callbackRouter);
app.use('/refresh_token', refreshTokenRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

// =============================================================================

var env = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.PORT == '8080' ? process.env.REDIRECT_URI_LOCAL : process.env.REDIRECT_URI
}

passport.use(new SpotifyStrategy({
    clientID: env.clientId,
    clientSecret: env.clientSecret,
    callbackURL: env.redirectUri
  },
  function(accessToken, refreshToken, expires_in, profile, done) {
    User.findOrCreate({ spotifyId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
