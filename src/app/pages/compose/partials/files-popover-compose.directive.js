(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('filesPopoverCompose', function () {
      return {
        restrict: 'A',
        controller : 'filesPopoverComposeController',
        controllerAs : 'ctrl',
        bindToController : true,
        scope: {
          uploadfiles : '=',
          attach : '='
        },
        link: function (scope, element, attrs) {

        }
      };
    });
})();
