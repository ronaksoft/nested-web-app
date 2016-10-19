(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarRevertMouseLeave', sidebarRevertMouseLeave);

  /** @ngInject */
  function sidebarRevertMouseLeave($timeout) {
    return {
      restrict: 'A',
      scope :{
        nstSidebarRevertMouseLeave : "="
      },
      link: function ($scope, $element, $attrs) {
        var jElelment = $($element[0]);
        var delay = $attrs.leaveDelay || 0;
        var closeHandler = null;
        jElelment.on('mouseleave', function () {
          closeHandler = $timeout(function () {
            $scope.nstSidebarRevertMouseLeave = false;
          }, delay);
        });

        jElelment.on('mouseenter', function () {
          if (closeHandler) {
            $timeout.cancel(closeHandler);
          }
        });
      }
    };
  }

})();
