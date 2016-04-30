(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ContextMenuController', ContextMenuController);

  /** @ngInject */
  function ContextMenuController($location, AuthService, NestedPlace, $scope) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }
  }
})();
