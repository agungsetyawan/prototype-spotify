var express = require('express');
var router = express.Router();
var axios = require('axios');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var SpotifyWebApi = require('spotify-web-api-node');
var jwt = require('jsonwebtoken');

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

async function getGenius(artist, title) {
  if (title.indexOf('-') != -1) {
    title = title.substring(0, title.indexOf('-')).trim();
  }
  if (title.indexOf('(') != -1) {
    title = title.substring(0, title.indexOf('(')).trim();
  }
  if (title.indexOf('feat') != -1) {
    title = title.substring(0, title.indexOf('feat')).trim();
  }
  if (artist.indexOf(',') != -1) {
    artist = artist.substring(0, artist.indexOf(',')).trim();
  }

  let query = title + ' ' + artist;
  query = query.replace(/[[(].*?[)\]]/g, '').trim() || query;
  const res = await axios.get('https://genius.com/api/search/song', {
    params: {
      q: query,
      per_page: 1
    }
  });
  if (res.data.response.sections[0].hits.length > 0) {
    return data = {
      id: res.data.response.sections[0].hits[0].result.id,
      url: res.data.response.sections[0].hits[0].result.url
    }
  } else {
    return data = {
      id: null,
      url: null
    }
  }
}

async function getLyrics(url) {
  const res = await axios.get(url);
  let $ = cheerio.load(res.data);
  return $('.lyrics').text().trim();
}

async function getDesc(id) {
  const res = await axios.get('https://genius.com/api/songs/' + id, {
    params: {
      text_format: 'plain'
    }
  });
  return res.data.response.song.description.plain;
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
        let genius = await getGenius(renderData.artist, renderData.title);
        if (genius.id !== null && genius.url !== null) {
          let lrc = await getLyrics(genius.url);
          renderData.lyrics = lrc;
          let desc = await getDesc(genius.id);
          renderData.description = desc;

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
