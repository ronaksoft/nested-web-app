(function() {
  'use strict';

  angular
    .module('nested')
    .controller('ComposeController', ComposeController);

  /** @ngInject */
  function ComposeController($location, AuthService, WsService, NestedPost, NestedPlace, $scope) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    $scope.post = new NestedPost();

    $scope.sendPost = function () {
    };
  }
})();
