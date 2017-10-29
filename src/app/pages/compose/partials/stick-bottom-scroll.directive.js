(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('stickBottomScroll', stickBottomScroll);

  function stickBottomScroll() {
    return {
      restrict: 'A',
      link: function (scope, el) {
        var constant = 200;
        scope.scrollEnd = function (forced){
          if ( window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              el[0].scrollTop = el[0].scrollHeight - el[0].clientHeight;
            }
          } else {
            if (scope.scrollInstance.maxScrollY - constant < scope.scrollInstance.y || forced) {
              scope.scrollInstance.scrollTo(0, scope.scrollInstance.maxScrollY)
            }
          }
          
        }

        
      }
    };
  }
})();
