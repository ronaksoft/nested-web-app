(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, NstSvcAuth) {
      $scope.user = NstSvcAuth.getUser();
    })
    .directive('nestedNavbarTop', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar_top.html',
      controller: 'NavBarController',
      controllerAs: 'navbarCtrl',
      bindToController: true
    };
  }
})();
