(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('createLabel', createLabel);

  /** @ngInject */
  function createLabel($location, $rootScope, $uibModal) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
        $element.click(function(){
            $uibModal.open({
                animation: false,
                size: 'sm',
                templateUrl: 'app/label/partials/create-label.html',
                controller: 'createLabelController',
                controllerAs: 'ctrl'
            })
        })
      }

    };

  }
})();
