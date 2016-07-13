(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, NstSvcAuth) {
      $scope.user = NstSvcAuth.user;
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
