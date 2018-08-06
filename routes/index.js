var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var mongoose = require('mongoose');
var SpotifyWebApi = require('spotify-web-api-node');
var Lyricist = require('lyricist');
var jwt = require('jsonwebtoken');
var lyricist = new Lyricist(process.env.GENIUS_CLIENT_ACCESS_TOKEN);

var userModel = require('../models/user_model');
var lyricsModel = require('../models/lyrics_model');

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

// api genius 'https://api.genius.com/search?q=<query>'
function getGeniusSearch(artist, title) {
  if (title.indexOf('-') != -1) {
    title = title.substring(0, title.indexOf('-')).trim();
  }
  if (title.indexOf('(') != -1) {
    title = title.substring(0, title.indexOf('(')).trim();
  }
  if (title.indexOf('feat') != -1) {
    title = title.substring(0, title.indexOf('feat')).trim();
  }
  artist = artist.replace(/\s/g, '');
  var query = title + ' ' + artist;
  // console.log(query);
  query = encodeURI(query);

  var optionsGeniusSearch = {
    uri: 'https://api.genius.com/search?q=' + query,
    auth: {
      'bearer': process.env.GENIUS_CLIENT_ACCESS_TOKEN
    },
    json: true
  }
  return rp(optionsGeniusSearch).then(
    function(body) {
      if (body.response.hits.length > 0) {
        return body.response.hits[0].result.id;
      } else {
        optionsGeniusSearch = {
          uri: 'https://api.genius.com/search?q=' + title,
          auth: {
            'bearer': process.env.GENIUS_CLIENT_ACCESS_TOKEN
          },
          json: true
        };
        return rp(optionsGeniusSearch).then(
          function(body) {
            if (body.response.hits.length > 0) {
              return body.response.hits[0].result.id;
            } else {
              return null;
            }
          }).catch(
          function(err) {
            console.error(err);
          }
        )
      }
    }).catch(
    function(err) {
      console.error(err);
    }
  );
}

function getColor(url) {
  var options = {
    uri: 'https://api.imagga.com/v1/colors?url=' + encodeURIComponent(url),
    headers: {
      'Authorization': 'Basic YWNjXzA2YzFlMDAxODQ1NTM5ZTphZjM3YTEzMzA0ZDc3YTA5MTZiMTU2NDRmNzUxMmYzYw=='
    },
    json: true
  }
  return rp(options).then(
    function(body) {
      var color = {
        primary: '#ffffff',
        secondary: '#000000'
      }
      color.primary = body.results[0].info.image_colors[0].html_code;
      color.secondary = body.results[0].info.image_colors[body.results[0].info.image_colors.length - 1].html_code;
      return color;
    }).catch(
    function(err) {
      console.error(err);
    }
  );
}

// function getLyrics(artist, title, callback) {
//   if ((artist.indexOf('/') != -1) || (artist.indexOf('\\') != -1)) {
//     artist = artist.replace(/(\/|\\)/gm, '');
//   }
//   if (title.indexOf('-') != -1) {
//     title = title.substring(0, title.indexOf('-')).trim();
//   }
//   if (artist.indexOf('ë') != -1) {
//     artist = artist.replace('ë', 'e');
//   }
//   if (artist.indexOf('é') != -1) {
//     artist = artist.replace('é', 'e');
//   }
//   var url = 'https://api.lyrics.ovh/v1/' + artist + '/' + title;
//   request(url, function(error, response, body) {
//     if (error || response.statusCode !== 200) {
//       return callback(error || {
//         statusCode: response.statusCode
//       });
//     }
//     // console.log(body);
//     var bodyParse = JSON.parse(body).lyrics;
//     var lyrics = bodyParse.includes('\n\n\n\n') ? '' : bodyParse;
//     console.log(bodyParse.includes('\n\n\n\n'));
//     if (bodyParse.includes('\n\n\n\n')) {
//       lyrics = bodyParse.substr(0, bodyParse.indexOf('\n\n') - 1);
//       // console.log(lyrics);
//       var temp = bodyParse.substr(bodyParse.indexOf('\n\n'), bodyParse.length);
//       // console.log(temp);
//       lyricsTemp = temp.replace(/\n\n/g, '\n');
//       lyrics += lyricsTemp;
//     } else {
//       var dataLyrics = {
//         artist: artist,
//         title: title,
//         lyrics: lyrics
//       }
//       lyricsModel.create(dataLyrics);
//     }
//     // console.log(lyrics);
//     callback(null, lyrics);
//   });
// }

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.cookies.spotify_access_token === undefined) {
    res.clearCookie('spotify_access_token');
    res.redirect('/auth');
  } else {
    spotifyApi.setAccessToken(req.cookies.spotify_access_token);
    spotifyApi.setRefreshToken(req.cookies.spotify_refresh_token);
    var OAuth = req.cookies.spotify_access_token;

    var id = '';
    var displayName = '';
    var product = '';
    var artists = [];
    var title = '';

    // Get the authenticated user
    spotifyApi.getMe().then(
      function(data) {
        // console.log('Some information about the authenticated user', data.body);
        id = data.body.id;
        displayName = data.body.display_name != null ? data.body.display_name : data.body.id;
        product = data.body.product;
        var query = {
          id: data.body.id
        }
        var dataUser = {
          birthdate: data.body.birthdate,
          country: data.body.country,
          display_name: data.body.display_name != null ? data.body.display_name : '',
          email: data.body.email,
          external_urls: {
            spotify: data.body.external_urls.spotify
          },
          id: data.body.id,
          images_url: data.body.images.length > 0 ? data.body.images[0].url : '',
          product: data.body.product,
          type: data.body.type,
          uri: data.body.uri
        }
        // console.log(dataUser);
        userModel.findOne(query, function(err, data) {
          if (err) {
            return console.log('Error mongodb:', err.message);
          } else {
            // console.log(data);
            if (data == null) {
              userModel.create(dataUser);
            } else {
              userModel.update(query, dataUser).exec();
            }
          }
        });

        // Get information about current playing song for signed in user
        spotifyApi.getMyCurrentPlaybackState({}).then(
          function(data) {
            // console.log(data);
            if (JSON.stringify(data.body) == '{}') {
              console.log(displayName + ' is offline');
              var data = {
                artist: 'Your spotify is offline',
                title: 'Hi, ' + displayName,
                lyrics: '?',
                description: '?',
                imageAlbum: dataUser.images_url != '' ? dataUser.images_url : '/images/Profile.svg',
                duration_ms: 0,
                progress_ms: 0,
                product: product
              }
              res.status(200);
              res.render('index', data);
            } else {
              var deviceId = data.body.device.id;
              var token = jwt.sign({
                OAuth: OAuth,
                deviceId: deviceId
              }, 'secret', {
                expiresIn: '10m'
              });
              res.cookie('jwt', token);

              data.body.item.artists.forEach(function(artist) {
                artists = artists.concat(artist.name);
              });
              title = data.body.item.name;
              console.log('=== ' + displayName + ' ♫ Now Playing:', title + ' · ' + artists.join(', ') + ' ===');
              var imageAlbum = data.body.item.album.images[1].url;
              var duration_ms = data.body.item.duration_ms;
              var progress_ms = data.body.progress_ms;

              async function myFunction() {
                // var color = await getColor(imageAlbum);
                var geniusSearch = await getGeniusSearch(artists[0], title);
                if (geniusSearch != null) {
                  var song = await lyricist.song(geniusSearch, {
                    fetchLyrics: true,
                    textFormat: 'plain'
                  });
                  var data = {
                    artist: artists.join(', '),
                    title: title,
                    lyrics: song.lyrics,
                    description: song.description.plain,
                    imageAlbum: imageAlbum,
                    duration_ms: duration_ms,
                    progress_ms: progress_ms,
                    product: product
                  }
                  res.status(200);
                  res.render('index', data);
                } else {
                  var data = {
                    artist: artists.join(', '),
                    title: title,
                    lyrics: 'Lyrics not found',
                    description: '?',
                    imageAlbum: imageAlbum,
                    duration_ms: duration_ms,
                    progress_ms: progress_ms,
                    product: product
                  }
                  res.status(200);
                  res.render('index', data);
                }
              }
              myFunction();

              // var queryFindLyrics = {
              //   artist: artists[0],
              //   title: title
              // }
              // lyricsModel.findOne(queryFindLyrics, function(err, data) {
              //   if (err) {
              //     return console.log('Error mongodb:', err.message);
              //   } else {
              //     if (data != null) {
              //       console.log('dapet lirik dari db');
              //       res.status(200);
              //       res.render('index', {
              //         artist: artists.join(', '),
              //         title: title,
              //         lyrics: data.lyrics,
              //         imageAlbum: imageAlbum,
              //         duration_ms: duration_ms,
              //         progress_ms: progress_ms
              //       });
              //     } else {
              //       getLyrics(artists[0], title, function(err, lyrics) {
              //         if (err) {
              //           console.log(err);
              //           console.log('Lyrics not found');
              //           res.status(200);
              //           res.render('index', {
              //             artist: artists.join(', '),
              //             title: title,
              //             lyrics: 'Lyrics not found',
              //             imageAlbum: imageAlbum,
              //             duration_ms: duration_ms,
              //             progress_ms: progress_ms
              //           });
              //         } else {
              //           res.status(200);
              //           res.render('index', {
              //             artist: artists.join(', '),
              //             title: title,
              //             lyrics: lyrics,
              //             imageAlbum: imageAlbum,
              //             duration_ms: duration_ms,
              //             progress_ms: progress_ms
              //           });
              //         }
              //       });
              //     }
              //   }
              // });
            }
          },
          function(err) {
            console.log('Something went wrong!', err);
          }
        );
        // end of spotifyApi.getMyCurrentPlaybackState
      },
      function(err) {
        console.log('Something went wrong!', err);
      }
    );
    // end of spotifyApi.getMe
  }
});

module.exports = router;
