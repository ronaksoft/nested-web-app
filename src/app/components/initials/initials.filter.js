(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .filter('initials', function () {
      return function (data, count) {
        return data && data.split(' ').slice(0, count).map(function (str) { return str.charAt(0).toUpperCase(); }).join('');
      }
    });

})();
