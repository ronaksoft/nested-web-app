(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, NstSvcAuth) {
      $scope.user = NstSvcAuth.user;
      $scope.topNavOpen = false;

      $scope.srch = function srch() {
        for (var i = 0; i < arguments.length; i++) {
          var id = arguments[i];
          var e = document.getElementById(id);
          if (e.style.display == 'block')
            e.style.display = 'none';
          else {
            e.style.display = 'block';
          }
        }
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
