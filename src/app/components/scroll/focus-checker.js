(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('focusChecker', focusChecker);

  /** @ngInject */
  function focusChecker($window,$rootScope,$timeout,_) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click change', function() {
          if ( $scope.ctlCompose.collapse ) {
            $scope.$emit('focus-rec');
          }
           $scope.ctlCompose.collapse = false;
        });

      }
    };
  }

})();
