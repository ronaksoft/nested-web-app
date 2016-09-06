(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ScrollChangeController', ScrollChangeController);

  /** @ngInject */
  function ScrollChangeController($scope) {
    var vm = this;
    console.log('from controller', vm.key);

    $(window).scroll(_.debounce(function (event) {
      vm.container.dispatchEvent(new CustomEvent(vm.key, {
        detail : event
      }));
    }, 265));
  }
})();
