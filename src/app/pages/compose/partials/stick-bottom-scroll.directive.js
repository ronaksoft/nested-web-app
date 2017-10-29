(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('stickBottomScroll', stickBottomScroll);

  function stickBottomScroll(_) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        var constant = 200;
        // scope.scrollEnd = _.debounce(scrollFn, 128)
        scope.scrollEnd = scrollFn
        
        function scrollFn(forced){
          console.log('scrollFn', forced);
          if ( window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              $('.focus-handler').focus();
              $('.post-card-comment-input textarea').focus();
            }
          } else {
            if (scope.scrollInstance.maxScrollY + constant > scope.scrollInstance.y || forced) {
              scope.scrollInstance.refresh()
              scope.scrollInstance.scrollToElement('.focus-handler');
            }
          }
          
        }

        
      }
    };
  }
})();
