(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('emojiInit', function ($timeout, _, NST_PROGRESSBAR_MODE) {
      return {
        restrict: 'A',
        link: function (scope, element , attrs) {
            if ( attrs.composeEmoji ) {
              wdtEmojiBundle.init(attrs.emojiInit,element[0]);
            } else {
              wdtEmojiBundle.init(attrs.emojiInit);
            }
          
        }
      };
    });
})();
