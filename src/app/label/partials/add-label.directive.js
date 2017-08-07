(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('addLabel', addLabel);

  /** @ngInject */
  function addLabel($location, $rootScope, $uibModal) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
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
                controllerAs: 'ctrl'
            })
        }
        $scope.$on('$destroy', function () {
          $element[0].removeEventListener("click", onClickHandler);
        });
      }

    };

  }
})();
