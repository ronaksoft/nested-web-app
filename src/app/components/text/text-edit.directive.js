(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('changeModal', changeModal);

  function changeModal($uibModal,NstSvcLogger) {
    return {
      restrict: 'A',
      scope: {
        changeModal: '='
      },
      link: function (scope ,element, attrs) {


        element.click(function () {
          scope.oldVal = scope.changeModal;
          $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'app/components/text/change-id.html',
            scope: scope
          }).result.then(function (result) {
            scope.changeModal = result
          }).catch(function (reason) {
            scope.changeModal = scope.oldVal;
            NstSvcLogger.error(reason)
          });
        })

      }
    };
  }
})();
