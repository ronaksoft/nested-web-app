(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ContextMenuController', ContextMenuController);

  /** @ngInject */
  function ContextMenuController($location, AuthService, NestedPlace, $scope) {
    var vm = this;
  }
})();
