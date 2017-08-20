(function() {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {

    $stateProvider.state('app.contacts', {
      url: '/contacts/:contactId',
      params: {
        contactId: ''
      },
      options: {
        group: 'contact'
      },
      onEnter: ['$rootScope', '$stateParams', '$state', '$uibModal', function($rootScope, $stateParams, $state, $uibModal) {
        $uibModal.open({
          animation: false,
          size: 'full-height-center',
          templateUrl: 'app/contacts/contact/contact.html',
          controller: 'ContactController',
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
