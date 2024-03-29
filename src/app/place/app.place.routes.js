(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
    .state('app.place-settings', {
      url: '/places/:placeId/settings',
      params: {
        placeId: NST_DEFAULT.STATE_PARAM,
        tab : 'info'
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        // $uibModalStack.dismissAll();

         $uibModal.open({
          animation: false,
          size: 'full-height-center',
          templateUrl: 'app/place/settings/place-settings.html',
          controller: 'PlaceSettingsController',
          controllerAs: 'ctrl'
        }).result.catch(function() {
          $rootScope.goToLastState(false);
        });
      }],
      onExit: function() { }
    });

  }

})();
