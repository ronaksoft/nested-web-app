(function() {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, NST_DEFAULT) {

    $stateProvider.state('app.contacts', {
      url: '/contacts/:contactId',
      params: {
        contactId: '',
      },
      options: {
        group: 'contact',
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        $uibModal.open({
          animation: false,
          size: 'lg-white',
          templateUrl: 'app/contacts/contact/contact.html',
          controller: 'ContactController',
          controllerAs: 'ctrl'
        }).result.catch(function() {
          $rootScope.goToLastState(true);
        });
      }],
      onExit: function($uibModalStack, $state) {
        
      }
    });

  }

})();
