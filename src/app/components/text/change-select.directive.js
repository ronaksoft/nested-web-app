(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('changeSelect', changeSelect);

  function changeSelect($uibModal,NstSvcLogger) {
    return {
      restrict: 'A',
      scope: {
        title: '=',
        val: '=',
        options: '='
      },
      link: function (scope ,element, attrs) {


        element.click(function () {
          scope.oldVal = {};
          scope.oldVal.val = scope.val;
          scope.oldVal.options = scope.options;
          $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'app/components/text/change-select.html',
            scope: scope
          }).result.then(function (result) {
            if ( result =! 'discard') scope.val = result
          }).catch(function (reason) {
            scope.val = scope.oldVal.val;
            NstSvcLogger.error(reason)
          });
        })

      }
    };
  }
})();
