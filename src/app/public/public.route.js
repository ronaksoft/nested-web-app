(function() {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider.state('public', {
      // abstract : true,
      controller : 'PublicController',
      controllerAs : 'ctlPublic',
      templateUrl : 'app/public/public-layout.html'
    });
  }

})();
