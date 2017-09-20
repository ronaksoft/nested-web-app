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
        },10);
        
        scope.$on('$destroy', function () {
            $timeout.cancel(interval);
        });
        
      }
    };
  }
})();
