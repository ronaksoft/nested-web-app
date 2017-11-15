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
        var scrollEndDeb = _.debounce(scrollFn, 128)
        scope.scrollEnd = scrollFn;
        var timer1 = null;
        scope.$on('$includeContentLoaded', function() {
          scrollEndDeb();
        });
        // console.log('00');
        function scrollFn(forced) {
          if (window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              $('.focus-handler').focus();
              if(document.activeElement){
                $(document.activeElement).focus();
              }
              timer1 = $timeout(function (){
                if(el[0].clientHeight + el[0].scrollTop !== el[0].scrollHeight) {
                  scrollFn(forced)
                }
              },256)
            }
            // scope.isScrolled = scope.scrollInstance.y > 0;
          } else {
            if (scope.scrollInstance.maxScrollY + constant > scope.scrollInstance.y || forced) {
              scope.scrollInstance.refresh();
              scope.scrollInstance.scrollToElement(document.querySelector('.focus-handler'));
              timer1 = $timeout(function (){
                if(scope.scrollInstance.y !== scope.scrollInstance.maxScrollY) {
                  scrollFn(forced)
                }
              }, 256)
            }
            // scope.isScrolled = scope.scrollInstance.y < 0;
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
