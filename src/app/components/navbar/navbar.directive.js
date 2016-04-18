(function() {
  'use strict';

  angular
    .module('nested')
    .controller('NavBarController', function($scope, AuthService, StoreService) {
      $scope.user = {
        fullname: null,
        avatar: '/assets/images/nested-logo-32.png'
      };

      AuthService.isAuthenticated(function () {
        $scope.user.fullname = AuthService.user.fname + ' ' + AuthService.user.lname;

        StoreService.toUrl(AuthService.user.picture.x32).then(function (url) {
          $scope.$apply(function () {
            $scope.user.avatar = url;
          });
        });
      });
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
