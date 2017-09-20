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
          scope.scrollInstance.on('scrollEnd', scope.ctrl.loadMore);
            // if ( ele[0].scrollTop + ele[0].clientHeight > ele[0].scrollHeight * 0.8 ) {
            //     scope.$apply(function () {
            //       scope.ctrl.loadMore();
            //     });
            // }
        },10);
        
        scope.$on('$destroy', function () {
            $timeout.cancel(interval);
        });
        
      }
    };
  }
})();
