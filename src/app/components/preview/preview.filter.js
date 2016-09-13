(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
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
