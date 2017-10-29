(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('loadMoreTop', loadMore);

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
            if (el[0].scrollTop < 5) {
              console.log('aaaaa', el[0].scrollTop)
              scope.loadMore();
            }
          } else {
            if (this.y > -5) {
              console.log('aaaaa', this.y)
              scope.loadMore();
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
