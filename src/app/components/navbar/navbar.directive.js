(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, AuthService) {
      $scope.user = AuthService.user;
      $scope.navScroll = function (event) {
        $('.nst-navbar').toggleClass('tiny', event.currentTarget.scrollTop > 55);
      };
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
