var express = require('express');
var router = express.Router();
var axios = require('axios');
var mongoose = require('mongoose');
var SpotifyWebApi = require('spotify-web-api-node');
var Lyricist = require('lyricist');
var jwt = require('jsonwebtoken');
var lyricist = new Lyricist(process.env.GENIUS_CLIENT_ACCESS_TOKEN);

const userModel = require('../models/user_model');
const lyricsModel = require('../models/lyrics_model');

const redirectUri = process.env.PORT == '3001' ? process.env.REDIRECT_URI_LOCAL : process.env.REDIRECT_URI;

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
});

async function getLyricsDb(artist, title) {
  let query = {
    artist: artist,
    title: title
  }
  return await lyricsModel.findOne(query).exec();
}

async function getGeniusId(artist, title) {
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

  let id;
  await axios({
      method: 'get',
      url: 'https://api.genius.com/search?q=' + encodeURI(title + ' ' + artist),
      headers: {
        'Authorization': 'Bearer ' + process.env.GENIUS_CLIENT_ACCESS_TOKEN
      }
    })
    .then(function(res) {
      if (res.data.response.hits.length > 0) {
        id = res.data.response.hits[0].result.id;
      } else {
        id = null;
      }
    })
    .catch(function(error) {
      console.error(error);
    });
  return id;
}

async function spotifyGetMe() {
  let userData = {
    imageUser: '',
    displayName: '',
    product: ''
  };
  await spotifyApi.getMe()
    .then(function(data) {
        let query = {
          id: data.body.id
        }
        let dataUser = {
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

        userData.imageUser = dataUser.images_url;
        userData.displayName = dataUser.display_name != '' ? dataUser.display_name : dataUser.id;
        userData.product = dataUser.product;

        userModel.findOne(query, function(err, data) {
          if (err) {
            console.error('Error mongodb:', err.message);
          } else {
            if (data === null) {
              userModel.create(dataUser);
            } else {
              userModel.update(query, dataUser).exec();
            }
          }
        });
      },
      function(err) {
        console.error('Something went wrong!', err);
      }
    );
  return userData;
}

async function spotifyGetMyCurrentPlaybackState() {
  let playbackData = {
    artist: null,
    title: null,
    imageAlbum: null,
    duration_ms: 0,
    progress_ms: 0,
    deviceId: null
  };
  await spotifyApi.getMyCurrentPlaybackState({})
    .then(function(data) {
        if (Object.keys(data.body).length !== 0 && data.body.constructor === Object) {
          let artists = [];
          data.body.item.artists.forEach(function(artist) {
            artists = artists.concat(artist.name);
          });
          playbackData.artist = artists.join(', ');
          playbackData.title = data.body.item.name;
          playbackData.imageAlbum = data.body.item.album.images[1].url;
          playbackData.duration_ms = data.body.item.duration_ms;
          playbackData.progress_ms = data.body.progress_ms;
          playbackData.deviceId = data.body.device.id;
        }
      },
      function(err) {
        console.error('Something went wrong!', err);
      }
    );
  return playbackData;
}

router.get('/', async function(req, res, next) {
  if (req.cookies.spotify_access_token === undefined) {
    res.clearCookie('spotify_access_token');
    res.redirect('/auth');
  } else {
    spotifyApi.setAccessToken(req.cookies.spotify_access_token);
    spotifyApi.setRefreshToken(req.cookies.spotify_refresh_token);

    let user = await spotifyGetMe();
    let playback = await spotifyGetMyCurrentPlaybackState();

    let renderData = {
      artist: 'Your spotify is offline',
      title: 'Hi, ' + user.displayName,
      lyrics: '?',
      description: '?',
      imageAlbum: user.imageUser != '' ? user.imageUser : '/images/Profile.svg',
      duration_ms: playback.duration_ms,
      progress_ms: playback.progress_ms,
      product: user.product
    }

    if (playback.deviceId !== null) {
      let OAuth = req.cookies.spotify_access_token;
      let deviceId = playback.deviceId;
      let token = jwt.sign({
        OAuth: OAuth,
        deviceId: deviceId
      }, 'secret', {
        expiresIn: '10m'
      });
      res.cookie('jwt', token);

      renderData.artist = playback.artist;
      renderData.title = playback.title;
      renderData.imageAlbum = playback.imageAlbum;
      console.info('= ' + user.displayName + ' ♫ Now Playing:', renderData.title + ' · ' + renderData.artist + ' =');

      let lyricsDb = await getLyricsDb(renderData.artist, renderData.title);
      if (lyricsDb !== null) {
        renderData.lyrics = lyricsDb.lyrics;
        renderData.description = lyricsDb.desc;
      } else {
        let art = renderData.artist;
        // console.log(art);
        let geniusId = await getGeniusId(renderData.artist, renderData.title);
        if (geniusId !== null) {
          let song = await lyricist.song(geniusId, {
            fetchLyrics: true,
            textFormat: 'plain'
          });
          renderData.lyrics = song.lyrics;
          renderData.description = song.description.plain;
          let lyricsData = {
            artist: renderData.artist,
            title: renderData.title,
            lyrics: renderData.lyrics,
            desc: renderData.description
          }
          await lyricsModel.create(lyricsData);
        } else {
          renderData.lyrics = 'Lyrics not found';
        }
      }
      res.status(200);
      res.render('spotify', renderData);
    } else {
      console.info(user.displayName + ' is offline');
      res.status(200);
      res.render('spotify', renderData);
    }
  }
});

module.exports = router;
