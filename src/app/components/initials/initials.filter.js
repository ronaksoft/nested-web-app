(function() {
  'use strict';

  angular
    .module('nested')
    .filter('initials', function () {
      return function (data, count) {
        return data.split(' ').slice(0, count).map(function (str) { return str.charAt(0).toUpperCase(); }).join('');
      }
    });

})();
