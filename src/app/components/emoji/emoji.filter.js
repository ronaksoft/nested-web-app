(function() {
  'use strict';

  angular
    .module('nested')
    .filter('emoji', function (emoji) {
      return function (toParse) {
        return emoji(toParse);
      };
    });
})();
