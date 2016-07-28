(function() {
  'use strict';

  angular
    .module('nested')
    .filter('emoji', function ($sce, emoji) {
      return function (toParse) {
        return $sce.trustAsHtml(emoji(toParse));
      };
    });
})();
