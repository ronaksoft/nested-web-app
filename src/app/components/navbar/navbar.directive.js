(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, AuthService) {
      $scope.user = AuthService.user;
    })
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html'
    };
  }

})();
