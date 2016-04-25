(function() {
  'use strict';

  angular
    .module('nested', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ngWebSocket', 'ngMd5', 'ui.router', 'ui.bootstrap', 'toastr'])
    .filter('initials', function () {
      return function (data, count) {
        return data.split(' ').slice(0, count).map(function (str) { return str.charAt(0).toUpperCase(); }).join('');
      }
    });
})();
