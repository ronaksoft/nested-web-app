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
        var scrollEndDeb = _.debounce(scrollFn, 128);
        scope.scrollEnd = scrollEndDeb;
        var timer1 = null;
        scope.$on('scroll-handler', function () {
          scrollEndDeb(false, scope.scrollBotDis);
        });
        // console.log('00');
        function scrollFn(forced, scrollBotDis) {
          if (window.nativeScroll) {
            if (scrollBotDis) {
              el[0].scrollTop = el[0].scrollHeight - scrollBotDis - el.height();
            } else if (el[0].clientHeight + el[0].scrollTop > el[0].scrollHeight - constant || forced) {
              el[0].scrollTop = el[0].scrollHeight;
              if (forced) {
                timer1 = $timeout(function () {
                  if (el[0].clientHeight + el[0].scrollTop !== el[0].scrollHeight) {
                    scrollFn(forced)
                  }
                }, 256)
              }

            }
            // console.log('scroll end');
            // var tagName = document.activeElement.tagName.toLowerCase();
            // console.log(tagName);
            // console.log( $('.focus-handler').offset().top, el.offset().top);
            // el[0].scrollTop = $('.focus-handler').offset().top + 200;
            // if(tagName === 'input' || tagName === 'textarea'){
            //   $('.focus-handler').blur().focus();
            //   $(document.activeElement).blur().focus();
            // } else {
            //   $('.focus-handler').blur().focus();
            // }

          } else {
            scope.scrollInstance.refresh();
            if (scrollBotDis) {
              scope.scrollInstance.scrollTo(0, scope.scrollInstance.maxScrollY - scrollBotDis);
            } else if (scope.scrollInstance.maxScrollY > scope.scrollInstance.y - constant || forced) {
              if(document.querySelector('.focus-handler')) {
                scope.scrollInstance.scrollToElement(document.querySelector('.focus-handler'));
              }
              if (forced) {
                timer1 = $timeout(function () {
                  if (scope.scrollInstance.y !== scope.scrollInstance.maxScrollY) {
                    scrollFn(forced)
                  }
                }, 256)
              }
            }
          }

        }

        scope.$on('$destroy', function () {
          if (timer1) {
            $timeout.cancel(timer1);
          }
        });

      }
    };
  }
})();
