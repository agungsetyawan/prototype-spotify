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

$('#bg').css({
  'background-image': 'linear-gradient(' + color_primary + ',' + color_secondary + ')'
});

if ((duration_ms != 0) && (progress_ms != 0)) {
  setTimeout(function() {
    window.location.reload(1);
  }, (duration_ms - progress_ms));
}
