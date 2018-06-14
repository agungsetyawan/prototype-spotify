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

function nextTrack(OAuth, deviceId) {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/next?device_id=' + deviceId,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OAuth
    }
  }).done(function() {
    window.location.reload(1);
  });
}

function prevTrack(OAuth, deviceId) {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/previous?device_id=' + deviceId,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OAuth
    }
  }).done(function() {
    window.location.reload(1);
  });
}

function pauseTrack(OAuth, deviceId) {
  $.ajax({
    type: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/pause?device_id=' + deviceId,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OAuth
    }
  }).done(function() {
    // window.location.reload(1);
  });
}

function playTrack(OAuth, deviceId) {
  $.ajax({
    type: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OAuth
    }
  }).done(function() {
    // window.location.reload(1);
  });
}

$(document).ready(function() {
  var vibrant_color = '#ffffff';
  var darkmuted_color = '#000000';
  var img = document.createElement('img');
  img.setAttribute('crossOrigin', '*');
  img.setAttribute('src', image_album);
  img.addEventListener('load', function() {
    var vibrant = new Vibrant(img);
    var swatches = vibrant.swatches();
    vibrant_color = swatches['Vibrant'].getHex();
    darkmuted_color = swatches['DarkMuted'].getHex();
    var bg = document.getElementById('bg');
    // bg.setAttribute('style', 'background-image: linear-gradient(' + vibrant_color + ' 60%' + ',' + darkmuted_color + ')');
    bg.setAttribute('style', 'background-image: linear-gradient(' + vibrant_color + ' 60%' + ', #000000 )');
  });
  OAuth = $.cookie('OAuth');
  deviceId = $.cookie('deviceId');

  $("meta[name='theme-color']").attr('content', vibrant_color);

  $('#next').click(function(e) {
    $('#next').addClass('disabled');
    $('#prev').addClass('disabled');
    $('#play').addClass('disabled');
    $('#pause').addClass('disabled');
    e.preventDefault();
    nextTrack(OAuth, deviceId);
  });

  $('#prev').click(function(e) {
    $('#next').addClass('disabled');
    $('#prev').addClass('disabled');
    $('#play').addClass('disabled');
    $('#pause').addClass('disabled');
    e.preventDefault();
    prevTrack(OAuth, deviceId);
  });

  $('#pause').click(function(e) {
    $('#pause').addClass('disabled');
    $('#play').removeClass('disabled');
    e.preventDefault();
    pauseTrack(OAuth, deviceId);
  });

  $('#play').click(function(e) {
    $('#play').addClass('disabled');
    $('#pause').removeClass('disabled');
    e.preventDefault();
    playTrack(OAuth, deviceId);
  });
});

if ((duration_ms != 0) && (progress_ms != 0)) {
  setTimeout(function() {
    window.location.reload(1);
  }, (duration_ms - progress_ms));
}
