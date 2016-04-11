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
    function NavbarController(AuthService, md5) {
      var vm = this;

      vm.user = {
        fullname: AuthService.user.fname + ' ' + AuthService.user.lname,
        avatar: 'http://www.gravatar.com/avatar/' + md5.createHash(AuthService.user.email) + '?s=32'
      };
    }
  }

})();
