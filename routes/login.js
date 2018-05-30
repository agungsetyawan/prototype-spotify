var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var stateKey = 'spotify_auth_state';

router.get('/', function(req, res, next) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scopes = ['user-library-read', 'user-library-modify',
      'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative',
      'user-read-recently-played', 'user-top-read',
      'user-read-private', 'user-read-email', 'user-read-birthdate',
      'streaming',
      'user-modify-playback-state', 'user-read-currently-playing', 'user-read-playback-state',
      'user-follow-modify', 'user-follow-read'
    ],
    redirectUri = process.env.REDIRECT_URI,
    clientId = process.env.CLIENT_ID,
    state = state;

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

module.exports = router;
