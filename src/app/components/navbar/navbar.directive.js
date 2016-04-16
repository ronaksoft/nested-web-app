(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedNavbar', nestedNavbar);

  /** @ngInject */
  function nestedNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
          creationDate: '='
      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController(AuthService, StoreService) {
      var vm = this;

      if (AuthService.isAuthenticated()) {
        vm.user = {
          fullname: AuthService.user.fname + ' ' + AuthService.user.lname,
          avatar: '/assets/images/nested-logo.png'
        };

        StoreService.toUrl(AuthService.user.picture.x32).then(function (url) {
          vm.user.avatar = url;
        });
      }
    }
  }

})();
