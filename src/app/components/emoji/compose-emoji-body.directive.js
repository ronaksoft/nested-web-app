(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('composeEmojiBody', function ($timeout, _, NST_PROGRESSBAR_MODE) {
      return {
        restrict: 'A',
        link: function (scope, element) {

            // wdtEmojiBundle.init('.wdt-emoji-bundle-enabled');
            // wdtEmojiBundle.replacePicker(element[0],'.fr-element');
            wdtEmojiBundle.init('.fr-element',element[0]);
          
        }
      };
    });
})();
