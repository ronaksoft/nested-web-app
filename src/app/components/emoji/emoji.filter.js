(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('emoji', function ($sce, emoji) {
      return function (toParse) {
        if (!toParse) {
          return "";
        }
        return $sce.trustAsHtml(emoji(toParse));
      };
    });
})();
