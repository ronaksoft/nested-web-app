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
      controller: function($scope, _, $) {
        var vm = this;
        var key = vm.handlerKey || 'body-scroll-change';
        var deregister = $scope.$on(key, function(data) {
          if (_.isFunction(vm.changed) && !vm.disabled) {
            vm.changed(data.event);
          }

          if (_.isFunction(vm.reachedBottom) && !vm.disabled) {
            if (document.body.offsetHeight- (window.innerHeight + window.scrollY)  <= 500) {
              vm.reachedBottom(data.event);
            }
          }

          if (_.isFunction(vm.reachedTop) && !vm.disabled) {
            if ($(window).scrollTop() === 0) {
              vm.reachedTop(data.event);
            }
          }

        });

        $scope.$on('$destroy', deregister);
      }
    };
  }

})();
