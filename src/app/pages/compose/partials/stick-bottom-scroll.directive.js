(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('stickBottomScroll', stickBottomScroll);

  function stickBottomScroll(_, $timeout) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        var constant = 200;
        // scope.scrollEnd = _.debounce(scrollFn, 128)
        scope.scrollEnd = scrollFn;
        var timer1 = null;
        function scrollFn(forced) {
          if (window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              $('.focus-handler').focus();
              $('.post-card-comment-input textarea').focus();
              timer1 = $timeout(function (){
                if(el[0].clientHeight + el[0].scrollTop !== el[0].scrollHeight) {
                  scrollFn(forced)
                }
              },256)
            }
          } else {
            if (scope.scrollInstance.maxScrollY + constant > scope.scrollInstance.y || forced) {
              scope.scrollInstance.refresh()
              scope.scrollInstance.scrollToElement(document.querySelector('.focus-handler'));
              timer1 = $timeout(function (){
                if(scope.scrollInstance.y !== scope.scrollInstance.maxScrollY) {
                  scrollFn(forced)
                }
              }, 256)
            }
          }

        }

        scope.$on('$destroy', function () {
          if(timer1){
            $timeout.cancel(timer1);
          }
        });

      }
    };
  }
})();
