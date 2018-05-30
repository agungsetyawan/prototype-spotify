var express = require('express');
var router = express.Router();
var request = require('request');
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

function getLyrics(artist, title, callback) {
  var url = 'https://api.lyrics.ovh/v1/' + artist + '/' + title;
  request(url, function(error, response, body) {
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
  // res.render('index', {
  //   title: 'Express'
  // });

  if (req.cookies.spotify_access_token === undefined) {
    res.redirect('/login');
  } else {
    spotifyApi.setAccessToken(req.cookies.spotify_access_token);
    var artists = [];
    var title = '';

    // Get information about current playing song for signed in user
    spotifyApi.getMyCurrentPlaybackState({}).then(
      function(data) {
        var item = data.body.item;
        for (var i = 0; i < item.artists.length; i++) {
          artists = artists.concat(item.artists[i].name);
        }
        title = data.body.item.name;
        // Output items
        console.log("Now Playing: ", artists.join(', ') + ' - ' + title);

        getLyrics(artists[0], title, function(err, body) {
          if (err) {
            console.log(err);
          } else {
            console.log(body.lyrics);
            var lyrics = body.lyrics.replace(/(\r\n|\n|\r)/gm,"<br>");
            res.status(200);
            res.send("Now Playing: " + artists.join(', ') + ' - ' + title + '<br><br><br>' + lyrics);
          }
        });
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
    );
  }
});

module.exports = router;
