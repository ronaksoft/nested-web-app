(function() {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .directive('appBanner', appBanner);

  function appBanner() {
    return {
      restrict: 'A',
      link: function () {
      }
    };
  }
})();
