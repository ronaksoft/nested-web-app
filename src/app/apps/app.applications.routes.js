(function() {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {

    $stateProvider.state('app.applications', {
      url: '/apps',
      params: {},
      options: {
        group: 'apps'
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        $uibModal.open({
          animation: false,
          size: 'full-height-center',
          templateUrl: 'app/apps/applications.html',
          controller: 'AppsController',
          controllerAs: 'ctrl'
        }).result.catch(function() {
          $rootScope.goToLastState(true);
        });
      }],
      onExit: function() {

      }
    });

  }

})();
