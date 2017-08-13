(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('modalScroll', modalScroll);

  function modalScroll($interval) {
    return {
      restrict: 'A',
      link: function (scope, ele) {
        var interval = setInterval(function(){
            if ( ele[0].scrollTop + ele[0].clientHeight > ele[0].scrollHeight * 0.8 ) {
                scope.$apply(function () {
                  scope.ctrl.loadMore();
                });
            }
        },1000);
        
        scope.$on('$destroy', function () {
            $interval.cancel(interval);
            clearInterval(interval);
        });
        
      }
    };
  }
})();
