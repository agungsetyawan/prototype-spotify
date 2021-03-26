// var h = window.innerHeight;
// var w = window.innerWidth;
// var center_y = h * 0.5,
//   center_x = w * 0.5;
// var points = [];
// var spacing = 20;
// var t = 0;
// for (var x = spacing; x < w - (spacing * 2); x += spacing) {
//   var y = center_y + Math.sin(t) * (center_y - spacing);
//   points.push([x, y]);
//   t += 0.5;
// }
// var pattern = Trianglify({
//   height: h,
//   width: w,
//   cell_size: 30 + Math.random() * 100
// });

// $('#bg').css({
//   'background-image': 'url(' + pattern.png() + ')'
// });

var OAuth = '';
var deviceId = '';

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}

function nextTrack(OAuth, deviceId) {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/next?device_id=' + deviceId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OAuth,
    },
    success: function () {
      console.log('next');
    },
    error: function (err) {
      console.log(JSON.stringify(err.responseJSON));
    },
  }).done(function () {
    window.location.reload(1);
  });
}

function prevTrack(OAuth, deviceId) {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/previous?device_id=' + deviceId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OAuth,
    },
    success: function () {
      console.log('prev');
    },
    error: function (err) {
      console.log(JSON.stringify(err.responseJSON));
    },
  }).done(function () {
    window.location.reload(1);
  });
}

function pauseTrack(OAuth, deviceId) {
  $.ajax({
    type: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/pause?device_id=' + deviceId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OAuth,
    },
    success: function () {
      console.log('pause');
    },
    error: function (err) {
      console.log(JSON.stringify(err.responseJSON));
    },
  });
}

function playTrack(OAuth, deviceId) {
  $.ajax({
    type: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OAuth,
    },
    data: '{}',
    success: function () {
      console.log('play');
    },
    error: function (err) {
      console.log(JSON.stringify(err.responseJSON));
    },
  });
}

$(document).ready(function () {
  var img = document.createElement('img');
  img.setAttribute('crossOrigin', '*');
  img.setAttribute('src', image_album);
  img.addEventListener('load', function () {
    var vibrant = new Vibrant(img);
    var swatches = vibrant.swatches();
    if (swatches['Vibrant'] == undefined) {
      var color = swatches['DarkMuted'].getHex();
    } else {
      var color = swatches['Vibrant'].getHex();
    }
    $("meta[name='theme-color']").attr('content', color);
    $('#bg').css(
      'background-image',
      'linear-gradient(' + color + ' 60%' + ', #000000 )'
    );
  });

  var token = $.cookie('jwt');
  var parseToken = parseJwt(token);
  OAuth = parseToken.OAuth;
  deviceId = parseToken.deviceId;

  $('#next').click(function (e) {
    $('#next').addClass('disabled');
    $('#prev').addClass('disabled');
    $('#pause').addClass('disabled');
    e.preventDefault();
    nextTrack(OAuth, deviceId);
  });

  $('#prev').click(function (e) {
    $('#next').addClass('disabled');
    $('#prev').addClass('disabled');
    $('#pause').addClass('disabled');
    e.preventDefault();
    prevTrack(OAuth, deviceId);
  });

  $('#pause').click(function (e) {
    var pause = $('#pause').hasClass('fa-pause');
    if (!pause) {
      e.preventDefault();
      playTrack(OAuth, deviceId);
      $('#pause').removeClass('fa-play');
      $('#pause').addClass('fa-pause');
    } else {
      e.preventDefault();
      pauseTrack(OAuth, deviceId);
      $('#pause').removeClass('fa-pause');
      $('#pause').addClass('fa-play');
    }
  });
});

if (duration_ms != 0 && progress_ms != 0) {
  setTimeout(function () {
    window.location.reload(1);
  }, duration_ms - progress_ms);
}
