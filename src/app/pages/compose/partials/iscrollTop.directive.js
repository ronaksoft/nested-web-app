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
          scope.scrollInstance.scrollTo(0,0);
        });
        
      }
    };
  }
})();
