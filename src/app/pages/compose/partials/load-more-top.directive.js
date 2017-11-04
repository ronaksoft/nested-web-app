(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('loadMoreTop', loadMore);

  function loadMore($timeout) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        scope.isScrolled = false;
        var timeout = $timeout(function () {
          if (window.nativeScroll) {
            el[0].addEventListener('scroll', handleScroll)
            el[0].dispatchEvent(new Event('scroll'))
          } else {
            scope.scrollInstance.on('scroll', handleScroll);
            handleScroll()
          }

        }, 10);
        var timeoutDispatchEvent = $timeout(function () {
          if (window.nativeScroll) {
            el[0].dispatchEvent(new Event('scroll'))
          } else {
            handleScroll()
          }

        }, 1024);

        function handleScroll() {

          if (window.nativeScroll) {
            if (el[0].scrollTop < 1) {
              scope.loadMore();
              scope.isScrolled = false;
            } else {
              scope.$apply(function (){
                scope.isScrolled = true;
              });
            }
          } else {
            if (scope.scrollInstance.y > -1) {
              scope.loadMore();
              scope.isScrolled = false;
            } else {
              scope.$apply(function (){
                scope.isScrolled = true;
              });
            }
          }
        }

        scope.$on('$destroy', function () {
          $timeout.cancel(timeout);
          $timeout.cancel(timeoutDispatchEvent);
          if (window.nativeScroll) {
            el[0].removeEventListener('scroll', handleScroll)
          } else {
            scope.scrollInstance.off('scroll', handleScroll);
          }
        });

      }
    };
  }
})();
