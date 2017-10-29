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
          console.log('scrollEnd');
          if ( window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              $('.focus-handler').focus();
            }
          } else {
            if (scope.scrollInstance.maxScrollY - constant < scope.scrollInstance.y || forced) {
              scope.scrollInstance.scrollToElement('.focus-handler');
            }
          }
          
        }

        
      }
    };
  }
})();
