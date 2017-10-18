(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollChangeHandler', scrollChangeHandler);

  /** @ngInject */
  function scrollChangeHandler() {
    return {
      restrict: 'E',
      scope: {
        key: '@eventKey',
        reachedBottom: '=',
        reachedTop: '=',
        changed: '=',
        disabled: '='
      },
      bindToController: true,
      controllerAs: 'ctlChange',
      controller: function($scope, _, $, $timeout) {
        var vm = this;
        var debouncer, initDebuoncer, initCnt = 0;
        // var key = vm.handlerKey || 'body-scroll-change';

        function conditionChecker(event) {
          if (_.isFunction(vm.changed) && !vm.disabled) {
            vm.changed(event);
          }

          if (_.isFunction(vm.reachedBottom) && !vm.disabled) {
            if (document.body.offsetHeight - (window.innerHeight + window.scrollY)  <= 300) {
              $timeout.cancel(debouncer);
              debouncer = $timeout(function () {
                vm.reachedBottom(event);
              }, 100);
            }
          }

          if (_.isFunction(vm.reachedTop) && !vm.disabled) {
            if ($(window).scrollTop() === 0) {
              $timeout.cancel(debouncer);
              debouncer = $timeout(function () {
                vm.reachedTop(event);
              }, 100);
            }
          }
        }

        var deregister = $(document).on('scroll', function(event) {
          initCnt++;
          if (initCnt > 9) {
            initCnt = 0;
          }
          $timeout.cancel(initDebuoncer);
          initDebuoncer = $timeout(function () {
            initCnt = 0;
            conditionChecker(event);
          }, 99);
          if (initCnt > 0) {
            return;
          }
          $timeout.cancel(initDebuoncer);
          conditionChecker(event);
        });

        $scope.$on('$destroy', function () {
          deregister.off();
        });
      }
    };
  }

})();
