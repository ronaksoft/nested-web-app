(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('appBanner', appBanner);

  function appBanner() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        // detect user and their resolution for showing cookie privacy
        // ios have his own api we just need to show this on android browsers ...
        if(getMobileOperatingSystem == 'Android') {
        }
        function getMobileOperatingSystem() {
          var userAgent = navigator.userAgent || navigator.vendor || window.opera;

          // Windows Phone must come first because its UA also contains "Android"
          if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
          }

          if (/android/i.test(userAgent)) {
            return "Android";
          }

          // iOS detection from: http://stackoverflow.com/a/9039885/177710
          if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
          }

          return "unknown";
        }
      }
    };
  }
})();
