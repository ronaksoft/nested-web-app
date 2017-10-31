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

        function scrollFn(forced) {
          if (window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              $('.focus-handler').focus();
              $('.post-card-comment-input textarea').focus();
              $timeout(function (){
                if(el[0].clientHeight + el[0].scrollTop !== el[0].scrollHeight) {
                  scrollFn(forced)
                }
              },256)
            }
          } else {
            if (scope.scrollInstance.maxScrollY + constant > scope.scrollInstance.y || forced) {
              scope.scrollInstance.refresh()
              scope.scrollInstance.scrollToElement(document.querySelector('.focus-handler'));
              $timeout(function (){
                if(scope.scrollInstance.y !== scope.scrollInstance.maxScrollY) {
                  scrollFn(forced)
                }
              },256)
            }
          }

        }


      }
    };
  }
})();
