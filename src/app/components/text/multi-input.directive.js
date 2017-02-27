(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('multiInput', multiInput);

  function multiInput($uibModal,NstSvcLogger) {
    return {
      restrict: 'A',
      scope: {
        title: '=',
        valOne: '=',
        valTwo: '='
      },
      link: function (scope ,element, attrs) {


        element.click(function () {
          scope.oldVal = {};
          scope.oldVal.valOne = scope.valOne;
          scope.oldVal.valTwo = scope.valTwo;
          $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'app/components/text/multiple-input.html',
            scope: scope
          }).result.then(function (result) {
            scope.valOne = result.valOne;
            scope.valTwo = result.valTwo;
          }).catch(function (reason) {
            scope.changeModal = scope.oldVal;
            NstSvcLogger.error(reason)
          });
        })

      }
    };
  }
})();
