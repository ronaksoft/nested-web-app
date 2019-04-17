(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('addLabel', addLabel);

  /** @ngInject */
  function addLabel($uibModal) {
    return {
      restrict: 'EA',
      scope: {
        afterAddLabel : '=',
        addedLabels : '='
      },
      link: function($scope, $element) {
        $element[0].addEventListener("click", onClickHandler);

        /**
         * @function createLabel
         * Opens the create label modal
         * @param {any} $event
         */
        function onClickHandler(){
            $uibModal.open({
                animation: false,
                size: 'full-height-center multiple',
                templateUrl: 'app/label/partials/add-label.html',
                controller: 'addLabelController',
                controllerAs: 'ctrl',
                resolve: {
                  argv: {
                    addedLabels: $scope.addedLabels
                  }
                }
            }).result.then($scope.afterAddLabel)
        }
        $scope.$on('$destroy', function () {
          $element[0].removeEventListener("click", onClickHandler);
        });
      }

    };

  }
})();
