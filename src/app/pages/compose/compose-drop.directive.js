(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('composeDrop', composeDrop);

  function composeDrop() {
    return {
      restrict: 'A',
      link: function (scope, ele, attrs) {

        var isFile = attrs.composeDrop === 'file';
        ele[0].parentElement.addEventListener("drop", drop);

        function drop(e) {
          if (isFile) {
            scope.ctlCompose.dodropFile(e);
          } else {
            scope.ctlCompose.dodropMultimedia(e);
          }
        }

        scope.$on('$destroy', function () {
          ele[0].parentElement.removeEventListener("drop", drop);
        });

      }
    };
  }
})();
