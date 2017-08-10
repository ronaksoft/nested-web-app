(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('manageLabelScroll', manageLabelScroll);

  function manageLabelScroll($interval) {
    return {
      restrict: 'A',
      link: function (scope, ele) {
        var interval = $interval(function(){
            if ( ele.parent()[0].scrollTop + ele.parent()[0].clientHeight > ele.parent()[0].scrollHeight * 0.9 ) {
                scope.ctrl.searchKeyUp();
            }
        },1000);
        
        scope.$on('$destroy', function () {
            $interval.cancel(interval);
        });
        
      }
    };
  }
})();
