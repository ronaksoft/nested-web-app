(function () {
  'use strict';

  angular
    .module('nested')
    .directive('scrollChangeObserver', scrollChangeObserver);

  /** @ngInject */
  function scrollChangeObserver(NstObservableObject) {
    return {
      restrict : 'E',
      controller : ScrollChangeController,
      controllerAs : 'ctlScroll',
      bindToController : true,
      scope : {
        key : '@observerKey'
      }
    };
  }

    function ScrollChangeController($scope, NstObservableObject) {
      var vm = this;
      vm.key = vm.key || 'body-scroll-change';

      vm.container = new NstObservableObject();

      $(window).scroll(_.debounce(function (event) {
        vm.container.dispatchEvent(new CustomEvent(vm.key, {
          detail : event
        }));
      }, 265));
    }


})();
