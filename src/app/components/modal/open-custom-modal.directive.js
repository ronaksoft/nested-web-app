(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.modal')
    .directive('openCustomModal', openCustomModal);

  function openCustomModal($uibModal) {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        element.click(function () {
          
          $uibModal.open({
            animation: false,
            size: attrs.size || 'sm',
            templateUrl: attrs.openCustomModal,
            scope : scope
          });

        });

      }
    };
  }
})();
