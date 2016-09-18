(function() {
  'use strict';

  angular
    .module('nested')
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
      },
      bindToController: true,
      controllerAs: 'ctlChange',
      controller: function($scope) {
        var vm = this;
        var key = vm.handlerKey || 'body-scroll-change';
        var deregister = $scope.$on(key, function(data) {
          if (_.isFunction(vm.changed)) {
            vm.changed(data.event);
          }

          if (_.isFunction(vm.reachedBottom)) {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
              vm.reachedBottom(data.event);
            }
          }

          if (_.isFunction(vm.reachedTop)) {
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
