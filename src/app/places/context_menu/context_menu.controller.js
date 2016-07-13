(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ContextMenuController', ContextMenuController);

  /** @ngInject */
  function ContextMenuController($location, NstSvcAuth, NestedPlace, $scope) {
    var vm = this;
  }
})();
