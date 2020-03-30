var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

const redirectUri = process.env.REDIRECT_URI;

router.get('/', function(req, res, next) {
  var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: redirectUri,
    refreshToken: req.cookie('spotify_refresh_token')
  });

  spotifyApi.refreshAccessToken().then(
    function(data) {
      console.log('The access token has been refreshed!');

      // Save the access token so that it's used in future calls
      // spotifyApi.setAccessToken(data.body['access_token']);

      res.cookie('spotify_access_token', data.body['access_token'], {
        maxAge: data.body['expires_in']
      });
    },
    function(err) {
      console.error('Could not refresh access token', err);
    }
  );
});

module.exports = router;
