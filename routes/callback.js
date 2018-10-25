var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var env = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.PORT == '3001' ? process.env.REDIRECT_URI_LOCAL : process.env.REDIRECT_URI
}

var spotifyApi = new SpotifyWebApi({
  clientId: env.clientId,
  clientSecret: env.clientSecret,
  redirectUri: env.redirectUri
});

/* Handle authorization callback from Spotify */
router.get('/', function(req, res, next) {
  var code = req.query.code;
  var state = req.query.state;

  /* Get the access token! */
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      res.cookie('spotify_access_token', data.body['access_token'], {
        maxAge: data.body['expires_in']
      });
      res.cookie('spotify_refresh_token', data.body['refresh_token']);

      res.redirect('/app');
    },
    function(err) {
      res.status(err.code);
      res.send(err.message);
    }
  );
});

module.exports = router;
