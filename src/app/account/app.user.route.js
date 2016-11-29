(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider.state('app.profile', {
      url: '/profile',
      templateUrl: 'app/account/profile/profile-edit.html',
      controller: 'ProfileEditController',
      controllerAs: 'ctlProfileEdit',
      options : {
        group : 'profile'
      }
    })
    .state('app.change-password', {
      url: '/change-password',
      templateUrl: 'app/account/change-password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctlPass',
      options : {
        group : 'profile'
      }
    });

  }

})();
