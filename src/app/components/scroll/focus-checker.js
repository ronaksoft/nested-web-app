(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('focusChecker', focusChecker);

  /** @ngInject */
  function focusChecker() {
    return {
      restrict: 'A',
      link: function ($scope, $element) {

        $element.on('click', checker);

        $scope.$on('$destroy', function () {
          $element.off('click', checker);
        });

        function checker() {
          $scope.$parent.$parent.ctlCompose.collapse = false;
        }
      }
    };
  }

})();
