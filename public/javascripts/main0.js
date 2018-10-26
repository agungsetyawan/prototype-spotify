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

  if ('serviceWorker' in navigator) {
    console.log("Will the service worker register?");
    navigator.serviceWorker.register('../service-worker.js')
      .then(function(reg) {
        console.log("Yes, it did.");
      }).catch(function(err) {
        console.log("No it didn't. This happened:", err)
      });
  }
}(jQuery));
