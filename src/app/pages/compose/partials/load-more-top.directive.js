(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('loadMoreTop', loadMore);

  function loadMore($timeout, _) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        scope.isScrolled = false;
        var timeout = $timeout(function () {
          if (window.nativeScroll) {
            el[0].addEventListener('scroll', handleScrollThr)
            // el[0].dispatchEvent(new Event('scroll'))
          } else {
            scope.scrollInstance.on('scroll', handleScrollThr);
          }
          handleScrollThr()

        }, 1);

        scope.$on('scroll-handler', function() {
          handleScrollDeb();
        });
        var handleScrollThr = _.throttle(handleScroll, 512)
        var handleScrollDeb = _.debounce(handleScroll, 512)

        function handleScroll() {
          scope.fullFilled = el[0].scrollTop > 0 || el[0].scrollHeight > el.height();
          if (window.nativeScroll) {
            if (el[0].scrollTop === 0 && scope.isScrolled) {
              scope.loadMore();
              scope.isScrolled = false;
            } else if(el[0].scrollTop !== 0 && !scope.isScrolled) {
              scope.isScrolled = true;
            }
            scope.scrollBotDis = el[0].scrollHeight - el[0].scrollTop - el.height();
          } else {
            if (scope.scrollInstance.y === 0 && scope.isScrolled) {
              scope.loadMore();
              scope.isScrolled = false;
            } else if(!scope.isScrolled && scope.scrollInstance.y !== 0) {
              scope.$apply(function (){
                scope.isScrolled = true;
              });
            }
            scope.scrollBotDis = scope.scrollInstance.maxScrollY - scope.scrollInstance.y;
          }
        }

        scope.$on('$destroy', function () {
          $timeout.cancel(timeout);
          if (window.nativeScroll) {
            el[0].removeEventListener('scroll', handleScrollThr)
          } else {
            scope.scrollInstance.off('scroll', handleScrollThr);
          }
        });

      }
    };
  }
})();
