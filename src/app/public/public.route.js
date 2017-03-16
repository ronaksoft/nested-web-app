(function() {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider.state('public', {
        // abstract : true,
        controller: 'PublicController',
        controllerAs: 'ctlPublic',
        templateUrl: 'app/public/public-layout.html'
      })
      .state('public.register', {
        url: '/register',
        controller: 'RegisterController',
        controllerAs: 'ctrl',
        templateUrl: 'app/public/register/register.html'
      })
      .state('public.recover-password', {
        url: '/recover/password',
        controller: 'RecoverPasswordController',
        controllerAs: 'ctrl',
        templateUrl: 'app/public/recover-password/recover-password.html'
      })
      .state('public.recover-username', {
        url: '/recover/username',
        controller: 'RecoverUsernameController',
        controllerAs: 'ctrl',
        templateUrl: 'app/public/recover-username/recover-username.html'
      })
      .state('public.register-with-phone', {
        url: '/register/phone/:phone',
        params: {
          phone: NST_DEFAULT.STATE_PARAM
        },
        controller: 'RegisterController',
        controllerAs: 'ctrl'
      });
  }

})();
