(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, AuthService) {
      $scope.user = AuthService.user;
      $scope.topNavOpen = false;
    })
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      controller: 'NavBarController',
      controllerAs: 'navbarCtrl',
      bindToController: true
    };
  }

})();
