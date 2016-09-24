(function() {
  'use strict';

  angular
    .module('nested')
    .filter('emoji', function ($sce, emoji) {
      return function (toParse) {
        if (!toParse) {
          return "";
        }
        return $sce.trustAsHtml(emoji(toParse));
      };
    });
})();
