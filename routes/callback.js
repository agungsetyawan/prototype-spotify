var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

const redirectUri = process.env.REDIRECT_URI;

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
});

/* Handle authorization callback from Spotify */
router.get('/', function(req, res, next) {
  let code = req.query.code;
  let state = req.query.state;

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
