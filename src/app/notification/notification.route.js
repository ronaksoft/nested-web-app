(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {
    $stateProvider
      .state('app.mentions', {
        url: '/mentions',
        templateUrl: 'app/notification/notification-popover.html',
        controller: 'NotificationsController',
        controllerAs: 'ctlNotifications',
        // params : {
        //   mentions : {
        //     array : true,
        //     value : []
        //   }
        // },
        options: {
          group: 'mention'
        }
      });

  }

})();
