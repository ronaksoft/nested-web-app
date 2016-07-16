(function() {
  'use strict';

  angular
    .module('nested')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'ctlMain'
      })

      /*****************************
       *****     Auth Routes    ****
       *****************************/

      .state('signin', {
        url: '/signin',
        templateUrl: 'app/login/login.html',
        controller: 'LoginController',
        controllerAs: 'ctlLogin'
      })
      .state('signout', {
        url: '/signout',
        controller: 'LogoutController',
        controllerAs: 'ctlLogout'
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/places/settings.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlPlaceSettings'
      })

      /*****************************
       *****  Activity Routes   ****
       *****************************/

      .state('activity', {
        url: '/activity',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('activity-bookmarks', {
        url: '/activity/bookmarks',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })

      /*****************************
       *****  Messages Routes   ****
       *****************************/

      .state('messages', {
        url: '/messages',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-bookmarks', {
        url: '/messages/bookmarks',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sent', {
        url: '/messages/sent',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
