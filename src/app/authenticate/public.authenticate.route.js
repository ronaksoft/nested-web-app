(function() {
  'use strict';

  angular
    .module('ronak.nested.web.authenticate')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {

    $stateProvider.state('public.signin', {
                  url : '/signin',
           controller : 'LoginController',
         controllerAs : 'ctlLogin',
          templateUrl : 'app/authenticate/login/login.html'
    }).state('public.signin-back', {
                  url : '/signin/:back',
               params : {
                 back : NST_DEFAULT.STATE_PARAM
               },
           controller : 'LoginController',
         controllerAs : 'ctlLogin',
          templateUrl : 'app/authenticate/login/login.html'
    }).state('public.signout', {
                  url : '/signout',
           controller : 'LogoutController',
         controllerAs : 'ctlLogout'
    });

  }

})();
