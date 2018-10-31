var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

const redirectUri = process.env.PORT == '3001' ? process.env.REDIRECT_URI_LOCAL : process.env.REDIRECT_URI;

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/', function(req, res, next) {
  let state = generateRandomString(16);
  res.cookie('spotify_auth_state', state);

  let scopes = ['user-library-read', 'user-library-modify',
    'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-collaborative',
    'user-read-recently-played', 'user-top-read',
    'user-read-private', 'user-read-email', 'user-read-birthdate',
    'streaming',
    'user-modify-playback-state', 'user-read-currently-playing', 'user-read-playback-state',
    'user-follow-modify', 'user-follow-read'
  ];

  // Create the authorization URL
  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

module.exports = router;
