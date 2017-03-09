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
        placeId: NST_DEFAULT.STATE_PARAM
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        var modal = $uibModal.open({
          animation: false,
          size: 'lg-white',
          templateUrl: 'app/place/settings/place-settings.html',
          controller: 'PlaceSettingsController',
          controllerAs: 'ctrl'
        }).result.catch(function() {
          $rootScope.goToLastState(true, {
            state : $state.get('app.place-messages'),
            params : { placeId : $stateParams.placeId },
            default : true
          });
        });
      }],
      onExit: function($uibModalStack) { }
    });

  }

})();
