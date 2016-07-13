(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, AuthService) {
      $scope.user = AuthService.user;

      $scope.open = function () {
        console.log(arguments);
        for (var i = 0; i < arguments.length; i++) {
          var id = arguments[i];
          var e = document.getElementById(id);
          console.log(e);
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
