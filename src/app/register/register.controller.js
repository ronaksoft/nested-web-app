(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope,
                              AuthService) {
    var vm = this;

    if (AuthService.isInAuthorization()) {
      $location.path('/').replace();
    }
    $scope.patterns = {
      password: {
        letters: /(?=.*[A-Z])(?=.*[a-z])/,
        symbolOrNumber: /(?=.*[\d~!@#\$%\^&\*\(\)\-_=\+\|\{\}\[\]\?\.])/
      },
      email: {
        all: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
      }
    };
    $scope.patterns.password.all = new RegExp($scope.patterns.password.letters.source + $scope.patterns.password.symbolOrNumber.source);
    console.log($scope.patterns.password.all);
  }
})();

