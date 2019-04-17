(function () {
  'use strict';

  angular
    .module('ronak.nested.web.authenticate')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {

    $stateProvider.state('public.signin', {
      url: '/signin',
      controller: 'workspaceController',
      controllerAs: 'ctrl',
      templateUrl: 'app/public/workspace/workspace.html'
    }).state('public.signin-back', {
      url: '/signin/:back',
      params: {
        back: NST_DEFAULT.STATE_PARAM
      },
      controller: 'workspaceController',
      controllerAs: 'ctrl',
      templateUrl: 'app/public/workspace/workspace.html'
    })

  }

})();
