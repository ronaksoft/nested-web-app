(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
    .state('app.settings', {
      url: '/settings',
      abstract: true,
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController',
      controllerAs: 'ctrl'
    })
    .state('app.settings.profile',{
      url: '/profile',
      templateUrl: 'app/settings/profile/edit-profile.html',
      controller: 'EditProfileController',
      controllerAs: 'ctrl',
      options : {
        group : 'settings',
        fullscreen : true
      }
    })
    .state('app.settings.password',{
      url: '/password',
      templateUrl: 'app/settings/password/change-password.html',
      controller: 'ChangePasswordController',
      controllerAs: 'ctrl',
      options : {
        group : 'settings',
        fullscreen : true
      }
    })
    .state('app.settings.sessions',{
      url: '/session',
      templateUrl: 'app/settings/sessions/active-sessions.html',
      controller: 'ActiveSessionsController',
      controllerAs: 'ctrl',
      options : {
        group : 'settings',
        fullscreen : true
      }
    })
    .state('app.settings.notification',{
      url: '/notification',
      templateUrl: 'app/settings/notification/manage-notification.html',
      controller: 'ManageNotificationController',
      controllerAs: 'ctrl',
      options : {
        group : 'settings',
        fullscreen : true
      }
    })
    .state('app.settings.language',{
      url: '/language',
      templateUrl: 'app/settings/language/select-language.html',
      controller: 'SelectLanguageController',
      controllerAs: 'ctrl',
      options : {
        group : 'settings',
        fullscreen : true
      }
    });

  }

})();
