(function() {
  'use strict';

  angular
    .module('ronak.nested.web.file')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
    .state('app.place-files', {
      url: '/places/:placeId/files/:filter/:search',
      params: {
        placeId: NST_DEFAULT.STATE_PARAM,
        filter: 'all',
        search: NST_DEFAULT.STATE_PARAM,
      },
      options : {
        group : 'file',
        primary : true
      },
      reloadOnSearch : false,
      templateUrl: 'app/files/files.html',
      controller: 'FilesController',
      controllerAs: 'ctlFiles'
    });

  }

})();
