(function() {
  'use strict';

  angular
    .module('ronak.nested.web.tasks')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {
    $stateProvider
    .state('app.tasks', {
      url: '/tasks',
      abstract: true,
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController',
      controllerAs: 'ctrl'
    })
    .state('app.tasks.glance',{
      url: '/glance',
      templateUrl: 'app/settings/profile/edit-profile.html',
      controller: 'EditProfileController',
      controllerAs: 'ctrl',
      options : {
        group : 'tasks',
        fullscreen : true
      }
    })

  }

})();
