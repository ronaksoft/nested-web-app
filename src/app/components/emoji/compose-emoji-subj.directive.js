(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('composeEmojiSubj', function ($timeout, _, NST_PROGRESSBAR_MODE) {
      return {
        restrict: 'A',
        link: function (scope, element) {

            wdtEmojiBundle.init('.wdt-emoji-bundle-enabled',element[0]);
            // wdtEmojiBundle.replacePicker(element[0],'.wdt-emoji-bundle-enabled');
            // wdtEmojiBundle.init('.fr-element');
          
        }
      };

      function modeIsValid(mode) {
        return _.values(NST_PROGRESSBAR_MODE).indexOf(mode) > -1;
      }
    });
})();
