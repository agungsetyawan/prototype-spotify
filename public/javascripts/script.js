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

$(document).ready(function() {
  var img = document.createElement('img');
  img.setAttribute('crossOrigin', '*');
  img.setAttribute('src', image_album);
  img.addEventListener('load', function() {
    var vibrant = new Vibrant(img);
    var swatches = vibrant.swatches();
    var vibrant_color = swatches['Vibrant'].getHex();
    var darkmuted_color = swatches['DarkMuted'].getHex();
    var bg = document.getElementById('bg');
    // bg.setAttribute('style', 'background-image: linear-gradient(' + vibrant_color + ' 60%' + ',' + darkmuted_color + ')');
    bg.setAttribute('style', 'background-image: linear-gradient(' + vibrant_color + ' 60%' + ', #000000 )');
  });
});

if ((duration_ms != 0) && (progress_ms != 0)) {
  setTimeout(function() {
    window.location.reload(1);
  }, (duration_ms - progress_ms));
}
