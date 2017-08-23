(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('manageLabelScroll', manageLabelScroll);

  function manageLabelScroll() {
    return {
      restrict: 'A',
      link: function (scope, ele) {
        var interval = setInterval(function(){
            if ( ele.parent()[0].scrollTop + ele.parent()[0].clientHeight > ele.parent()[0].scrollHeight * 0.9 ) {
                scope.$apply(function () {
                  scope.ctrl.searchKeyUp();
                });
            }
        },1000);

        scope.$on('$destroy', function () {
            clearInterval(interval);
        });

      }
    };
  }
})();
