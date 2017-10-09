(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('iscrollTop', iscrollTop);

  function iscrollTop() {
    return {
      restrict: 'A',
      link: function (scope, el, attr) {
        
        scope.$watch(function (){
          return attr.iscrollTop
        }, function () {
          if ( window.nativeScroll) {
            el[0].scrollTop = 0
            el[0].scrollLeft = 0
          } else {
            scope.scrollInstance.scrollTo(0,0);
          }
        });
        
      }
    };
  }
})();
