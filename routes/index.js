var express = require('express');
var router = express.Router();
var request = require('request');
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.PORT == '8080' ? process.env.REDIRECT_URI : 'https://spotifyz.herokuapp.com/callback/'
});

function getLyrics(artist, title, callback) {
  var url = 'https://api.lyrics.ovh/v1/' + artist + '/' + title;
  request(url, function(error, response, body) {
    // console.log(JSON.parse(body));
    if (error || response.statusCode !== 200) {
      return callback(error || {
        statusCode: response.statusCode
      });
    }
    callback(null, JSON.parse(body));
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.cookies.spotify_access_token === undefined) {
    res.clearCookie('spotify_access_token');
    res.redirect('/login');
  } else {
    spotifyApi.setAccessToken(req.cookies.spotify_access_token);
    spotifyApi.setRefreshToken(req.cookies.spotify_refresh_token);

    var artists = [];
    var title = '';

    // Get the authenticated user
    spotifyApi.getMe().then(
      function(data) {
        console.log('Some information about the authenticated user', data.body);
        console.log('\n=== User detail ===');
        console.log('Display name:', data.body.display_name);
        console.log('Email:', data.body.email);
        console.log('Birth date:', data.body.birthdate);
        console.log('image:', data.body.images.length > 0 ? data.body.images[0].url : 'null');
        console.log('url:', data.body.external_urls.spotify);
        console.log('Product:', data.body.product);
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
    );

    // Get information about current playing song for signed in user
    spotifyApi.getMyCurrentPlaybackState({}).then(
      function(data) {
        if (JSON.stringify(data.body) === '{}') {
          console.log('You are offline');
          res.status(200);
          res.send('You are offline');
        } else {
          data.body.item.artists.forEach(function(artist) {
            artists = artists.concat(artist.name);
          });
          title = data.body.item.name;
          // Output items
          console.log('\n=== ♫ Now Playing:', artists.join(', ') + ' - ' + title + ' ===\n');

          getLyrics(artists[0], title, function(err, body) {
            if (err) {
              console.log(err);
              console.log('Lyrics not found\n');
              res.status(200);
              res.render('index', {
                title: artists.join(', ') + ' - ' + title,
                lyrics: 'Lyrics not found\n'
              });
            } else {
              // console.log(body.lyrics + '\n');
              var lyrics = body.lyrics.replace(/(\r\n|\n|\r)/gm, "<br>");
              res.status(200);
              res.render('index', {
                title: '♫ ' + artists.join(', ') + ' - ' + title,
                lyrics: lyrics
              });
            }
          });
        }
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
    );
  }
});

module.exports = router;
