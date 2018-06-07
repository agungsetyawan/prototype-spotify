var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var SpotifyWebApi = require('spotify-web-api-node');

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

function getLyrics(artist, title, callback) {
  if ((artist.indexOf('/') != -1) || (artist.indexOf('\\') != -1)) {
    artist = artist.replace(/(\/|\\)/gm, '');
  }
  if (title.indexOf('-') != -1) {
    title = title.substring(0, title.indexOf('-')).trim();
  }
  if (artist.indexOf('ë') != -1) {
    artist = artist.replace('ë', 'e');
  }
  if (artist.indexOf('é') != -1) {
    artist = artist.replace('é', 'e');
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
      lyrics = bodyParse.substr(0, bodyParse.indexOf('\n\n') - 1);
      // console.log(lyrics);
      var temp = bodyParse.substr(bodyParse.indexOf('\n\n'), bodyParse.length);
      // console.log(temp);
      lyricsTemp = temp.replace(/\n\n/g, '\n');
      lyrics += lyricsTemp;
    } else {
      var dataLyrics = {
        artist: artist,
        title: title,
        lyrics: lyrics
      }
      lyricsModel.create(dataLyrics);
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

    var id = '';
    var displayName = '';
    var artists = [];
    var title = '';

    // Get the authenticated user
    spotifyApi.getMe().then(
      function(data) {
        // console.log('Some information about the authenticated user', data.body);
        id = data.body.id;
        displayName = data.body.display_name != null ? data.body.display_name : data.body.id;
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
              res.status(200);
              res.render('index', {
                artist: 'Your spotify is offline',
                title: '',
                lyrics: ''
              });
            } else {
              data.body.item.artists.forEach(function(artist) {
                artists = artists.concat(artist.name);
              });
              title = data.body.item.name;
              console.log('=== ' + displayName + ' ♫ Now Playing:', artists.join(', ') + ' • ' + title + ' ===');
              var imageAlbum = data.body.item.album.images[0].url;
              var duration_ms = data.body.item.duration_ms;
              var progress_ms = data.body.progress_ms;

              var queryFindLyrics = {
                artist: artists[0],
                title: title
              }
              lyricsModel.findOne(queryFindLyrics, function(err, data) {
                if (err) {
                  return console.log('Error mongodb:', err.message);
                } else {
                  if (data != null) {
                    console.log('dapet lirik dari db');
                    res.status(200);
                    res.render('index', {
                      artist: artists.join(', '),
                      title: title,
                      lyrics: data.lyrics,
                      imageAlbum: imageAlbum,
                      duration_ms: duration_ms,
                      progress_ms: progress_ms
                    });
                  } else {
                    getLyrics(artists[0], title, function(err, lyrics) {
                      if (err) {
                        console.log(err);
                        console.log('Lyrics not found');
                        res.status(200);
                        res.render('index', {
                          artist: artists.join(', '),
                          title: title,
                          lyrics: 'Lyrics not found',
                          imageAlbum: imageAlbum,
                          duration_ms: duration_ms,
                          progress_ms: progress_ms
                        });
                      } else {
                        res.status(200);
                        res.render('index', {
                          artist: artists.join(', '),
                          title: title,
                          lyrics: lyrics,
                          imageAlbum: imageAlbum,
                          duration_ms: duration_ms,
                          progress_ms: progress_ms
                        });
                      }
                    });
                  }
                }
              });
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
