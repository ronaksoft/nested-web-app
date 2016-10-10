(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
      .state('app.mentions', {
        url: '/mentions',
        templateUrl: 'app/mention/mentions.html',
        controller: 'MentionsController',
        controllerAs: 'ctlMentions',
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
