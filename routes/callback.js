var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var env = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.PORT == '8080' ? process.env.REDIRECT_URI : 'https://spotifyz.herokuapp.com/callback/'
}

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: env.clientId,
  clientSecret: env.clientSecret,
  redirectUri: env.redirectUri
});

/* Handle authorization callback from Spotify */
router.get('/', function(req, res, next) {
  /* Read query parameters */
  var code = req.query.code; // Read the authorization code from the query parameters
  var state = req.query.state; // (Optional) Read the state from the query parameter

  /* Get the access token! */
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      // console.log(data.body);
      // console.log('The token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);
      // console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      // spotifyApi.setAccessToken(data.body['access_token']);
      // spotifyApi.setRefreshToken(data.body['refresh_token']);

      // if (req.cookies.spotify_access_token === undefined) {
      res.cookie('spotify_access_token', data.body['access_token'], {
        maxAge: data.body['expires_in']
      });
      res.cookie('spotify_refresh_token', data.body['refresh_token']);
      // }

      res.redirect('/');
    },
    function(err) {
      res.status(err.code);
      res.send(err.message);
    }
  );
});

module.exports = router;
