(function () {
  'use strict';

  var videos = document.querySelectorAll('.video-block__player video, .media-gallery__video video');
  if (videos.length < 2) return;

  videos.forEach(function (video) {
    video.addEventListener('play', function () {
      videos.forEach(function (other) {
        if (other !== video && !other.paused) {
          other.pause();
        }
      });
    });
  });
})();
