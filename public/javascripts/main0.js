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
          src: "../images/01.jpg"
        },
        {
          src: "../images/02.jpg"
        },
        {
          src: "../images/03.jpg"
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
