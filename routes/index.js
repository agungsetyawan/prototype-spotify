var express = require('express');
var router = express.Router();
var request = require('request');
var SpotifyWebApi = require('spotify-web-api-node');

var env = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.PORT == '8080' ? process.env.REDIRECT_URI_LOCAL : process.env.REDIRECT_URI
}

var spotifyApi = new SpotifyWebApi({
  clientId: env.clientId,
  clientSecret: env.clientSecret,
  redirectUri: env.redirectUri
});

function getLyrics(artist, title, callback) {
  if ((artist.indexOf('/') != -1) || (artist.indexOf('\\') != -1)) {
    artist = artist.replace(/(\/|\\)/gm, "");
  }
  if (title.indexOf('-') != -1) {
    title = title.substring(0, title.indexOf('-')).trim();
  }
  var url = 'https://api.lyrics.ovh/v1/' + artist + '/' + title;
  request(url, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      return callback(error || {
        statusCode: response.statusCode
      });
    }
    // console.log(body);
    var bodyParse = JSON.parse(body).lyrics;
    var lyrics = bodyParse.includes('\n\n\n\n') ? '' : bodyParse;
    console.log(bodyParse.includes('\n\n\n\n'));
    if (bodyParse.includes('\n\n\n\n')) {
      lyrics = bodyParse.substr(0, bodyParse.indexOf('\n\n')-1);
      // console.log(lyrics);
      var temp = bodyParse.substr(bodyParse.indexOf('\n\n'), bodyParse.length);
      // console.log(temp);
      lyricsTemp = temp.replace(/\n\n/g, '\n');
      lyrics += lyricsTemp;
    }
    // console.log(lyrics);
    callback(null, lyrics);
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.cookies.spotify_access_token === undefined) {
    res.clearCookie('spotify_access_token');
    res.redirect('/auth');
  } else {
    spotifyApi.setAccessToken(req.cookies.spotify_access_token);
    spotifyApi.setRefreshToken(req.cookies.spotify_refresh_token);

    var artists = [];
    var title = '';

    // Get the authenticated user
    spotifyApi.getMe().then(
      function(data) {
        // console.log('Some information about the authenticated user', data.body);
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
        // console.log(data);
        if (JSON.stringify(data.body) === '{}') {
          console.log('You are offline');
          res.status(200);
          // res.send('Your spotify is offline');
          res.render('index', {
            artist: 'Your spotify is offline'
          });
        } else {
          data.body.item.artists.forEach(function(artist) {
            artists = artists.concat(artist.name);
          });
          title = data.body.item.name;
          console.log('\n=== ♫ Now Playing:', artists.join(', ') + ' • ' + title + ' ===\n');

          getLyrics(artists[0], title, function(err, lyrics) {
            if (err) {
              console.log(err);
              console.log('Lyrics not found\n');
              res.status(200);
              res.render('index', {
                artist: artists.join(', '),
                title: title,
                lyrics: 'Lyrics not found\n',
                imageAlbum: data.body.item.album.images[0].url,
                duration_ms: data.body.item.duration_ms,
                progress_ms: data.body.progress_ms
              });
            } else {
              res.status(200);
              res.render('index', {
                artist: artists.join(', '),
                title: title,
                lyrics: lyrics,
                imageAlbum: data.body.item.album.images[0].url,
                duration_ms: data.body.item.duration_ms,
                progress_ms: data.body.progress_ms
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
