(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('loadMore', loadMore);

  function loadMore($timeout) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        
        var interval = $timeout(function(){
          if (window.nativeScroll) {
            el[0].addEventListener('scroll', handleScroll)
          } else {
            scope.scrollInstance.on('scroll', handleScroll);
          }
        },10);
        function handleScroll(){
          if ( window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop> .9 * el[0].scrollHeight) {
              scope.ctrl.loadMore();
            }
          } else {
            if (this.wrapperHeight - this.y > .9 * this.scrollerHeight) {
              scope.ctrl.loadMore();
            }
          }
          
        }
        
        scope.$on('$destroy', function () {
            $timeout.cancel(interval);
            if ( window.nativeScroll) {
              el[0].removeEventListener('scroll',handleScroll)
            } else {
              scope.scrollInstance.off('scroll', handleScroll);
            }
        });
        
      }
    };
  }
})();
