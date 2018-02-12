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
        scope.$on('scroll-handler', function() {
          scrollEndDeb();
        });
        // console.log('00');
        function scrollFn(forced) {
          if (window.nativeScroll) {
            if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              // console.log('scroll end');
              // var tagName = document.activeElement.tagName.toLowerCase();
              // console.log(tagName);
              // console.log( $('.focus-handler').offset().top, el.offset().top);
              // el[0].scrollTop = $('.focus-handler').offset().top + 200;
              el[0].scrollTop = el[0].scrollHeight;
              // if(tagName === 'input' || tagName === 'textarea'){
              //   $('.focus-handler').blur().focus();
              //   $(document.activeElement).blur().focus();
              // } else {
              //   $('.focus-handler').blur().focus();
              // }
              timer1 = $timeout(function (){
                // console.log(el[0].clientHeight , el[0].scrollTop , el[0].scrollHeight, el[0].clientHeight + el[0].scrollTop !== el[0].scrollHeigh);
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
