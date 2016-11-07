(function() {
  'use strict';

  angular
    .module('ronak.nested.web.register')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {

    $stateProvider.state('public.register', {
                  url : '/register',
           controller : 'RegisterController',
         controllerAs : 'ctlRegister',
          templateUrl : 'app/register/register.html'
    }).state('public.recover', {
                  url : '/recover',
           controller : 'ResetPasswordController',
         controllerAs : 'ctlRecover',
          templateUrl : 'app/register/reset-password/reset-password.html'
    }).state('public.register-with-phone', {
                  url : '/register/phone/:phone',
               params : {
                 phone : NST_DEFAULT.STATE_PARAM
               },
           controller : 'RegisterController',
         controllerAs : 'ctlRegister'
    });

  }

})();
