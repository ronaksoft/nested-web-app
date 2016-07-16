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
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('activity-bookmarks', {
        url: '/activity/bookmarks',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('activity-bookmarks-filtered', {
        url: '/activity/bookmarks/:filter',
        params: {
          filter: '_'
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: '_'
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
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
      .state('place-activity-filtered', {
        url: '/places/:placeId/activity/:filter',
        params: {
          placeId: '_',
          filter: '_'
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
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-bookmarks', {
        url: '/messages/bookmarks',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-bookmarks-sorted', {
        url: '/messages/bookmarks/:sort',
        params: {
          sort: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sent', {
        url: '/messages/sent',
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sent-sorted', {
        url: '/messages/sent/:sort',
        params: {
          sort: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sorted', {
        url: '/messages/:sort',
        params: {
          sort: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('place-messages-sorted', {
        url: '/places/:placeId/messages/:sort',
        params: {
          placeId: '_',
          sort: '_'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
