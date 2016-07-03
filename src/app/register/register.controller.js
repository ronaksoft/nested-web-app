(function() {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope,
                              AuthService, WsService) {
    var vm = this;

    if (AuthService.isInAuthorization()) {
      $location.path('/').replace();
    }

    $scope.stateChanged = function (qId) {
      if($scope.answers[qId]){
        vm.checkBox = {
          text : "in order to use our services, you must agree to nested Terms of Service."
        };
      }
    }

    $scope.checkUser =_.debounce(checckUsers, 550);
    function checckUsers (val) {
      WsService.request('place/exists', {userName: val}).then(function (value) {
        $scope.avaiablity = false;
        vm.alreadyTaken = {
          text : ":( Sorry, its not available"
        };
        console.log(x);
        vm.notTaken = {
          text : ""
        };

      }).catch(function () {
        $scope.avaiablity = true;
        vm.notTaken = {
          text : ":) its available"
        };
        console.log(v);
        vm.alreadyTaken = {
          text : ""
        };
      });

    }

    $scope.patterns = {
      password: {
        letters: /(?=.*[A-Z])(?=.*[a-z])/,
        symbolOrNumber: /(?=.*[\d~!@#\$%\^&\*\(\)\-_=\+\|\{\}\[\]\?\.])/,
      },
      email: {
        all: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
      }
    };
    $scope.patterns.password.all = new RegExp($scope.patterns.password.letters.source + $scope.patterns.password.symbolOrNumber.source);
  }
})();

