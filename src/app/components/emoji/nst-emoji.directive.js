(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('emojiInit', function ($timeout, _, progressBar, NST_PROGRESSBAR_MODE) {
      return {
        restrict: 'A',
        link: function (scope, element) {

            wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
          
        }
      };

      function modeIsValid(mode) {
        return _.values(NST_PROGRESSBAR_MODE).indexOf(mode) > -1;
      }
    });
})();
