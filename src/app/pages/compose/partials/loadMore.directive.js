(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('loadMore', loadMore);

  function loadMore($timeout) {
    return {
      restrict: 'A',
      link: function (scope) {
        
        var interval = $timeout(function(){
          scope.scrollInstance.on('scroll', handleScroll);
        },10);
        function handleScroll(){
          if (this.wrapperHeight - this.y > .9 * this.scrollerHeight) {
            scope.ctrl.loadMore();
          }
        }
        
        scope.$on('$destroy', function () {
            $timeout.cancel(interval);
            scope.scrollInstance.off('scroll', handleScroll);
        });
        
      }
    };
  }
})();