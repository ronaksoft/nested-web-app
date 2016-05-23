(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AccountProfileController', AccountProfileController);

  /** @ngInject */
  function AccountProfileController($location, $scope, AuthService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    $scope.user = AuthService.user;
  }
})();
