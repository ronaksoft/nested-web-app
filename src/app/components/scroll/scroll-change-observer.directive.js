(function () {
  'use strict';

  angular
    .module('nested')
    .directive('scrollChangeObserver', scrollChangeObserver);

  /** @ngInject */
  function scrollChangeObserver() {
    return {
      restrict : 'E',
      bindToController : true,
      scope : {
        key : '@eventKey'
      },
      controllerAs : 'ctlChange',
      controller : function ($scope, $rootScope) {
        var vm = this;
        var key = vm.key || 'body-scroll-change';

        $(window).scroll(_.debounce(function (event) {
          $rootScope.$broadcast(key, { event : event });
        }, 265));
      }
    };
  }

})();
