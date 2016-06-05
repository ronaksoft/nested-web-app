(function() {
  'use strict';

  angular
    .module('nested')
    .filter('preview', function () {

      return function (text) {
        if (!text) {
          return '';
        }

        var converted = String(text).replace(/<\s*br[^>]*>/gm,'¶');
        converted = String(converted).replace(/<[^>]+>/gm, ' ');

        return converted;
      };
    });
})();
