(function($) {
  "use strict";
  $(window).on('load', function() {
    $('#preloader').fadeOut();

    $("#bg").vegas({
      timer: false,
      delay: 6000,
      transitionDuration: 2000,
      transition: "blur",
      slides: [{
          src: "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-169365.jpg"
        },
        {
          src: "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-424773.jpg"
        },
        {
          src: "https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-516461.jpg"
        }
      ]
    });
  });
}(jQuery));
