(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('composeDrop', composeDrop);

  function composeDrop() {
    return {
      restrict: 'A',
      link: function (scope, ele) {
        ele[0].addEventListener("drop", scope.ctlCompose.dodrop);

        scope.$on('$destroy', function () {
            ele[0].removeEventListener("drop", scope.ctlCompose.dodrop);
        });

      }
    };
  }
})();
