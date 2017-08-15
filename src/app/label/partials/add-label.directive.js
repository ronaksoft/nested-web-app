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
                size: 'lg-white multiple',
                templateUrl: 'app/label/partials/add-label.html',
                controller: 'addLabelController',
                controllerAs: 'ctrl',
                resolve: {
                  argv: {
                    addedLabels: $scope.addedLabels
                  }
                }
            }).result.then(function(items){
              // console.log(items);
              $scope.afterAddLabel(items);
            })
        }
        $scope.$on('$destroy', function () {
          $element[0].removeEventListener("click", onClickHandler);
        });
      }

    };

  }
})();
