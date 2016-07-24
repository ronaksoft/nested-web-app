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
       *****    User Routes     ****
       *****************************/

      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'ProfileController',
        controllerAs: 'ctlProfile'
      })

      /*****************************
       *****   Compose Routes   ****
       *****************************/

      .state('compose', {
        url: '/compose',
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('place-compose', {
        url: '/compose/:placeId',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-forward', {
        url: '/forward/:postId',
        params: {
          postId: '_'
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-reply-all', {
        url: '/reply/:postId',
        params: {
          postId: '_'
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-reply-sender', {
        url: '/reply/:postId/sender',
        params: {
          postId: '_'
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/places/settings/main.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlPlaceSettings'
      })
      .state('place-add', {
        url: '/places/:placeId/add',
        params: {
          placeId: '_'
        },
        templateUrl: 'app/places/add/main.html',
        controller: 'PlaceAddController',
        controllerAs: 'ctlPlaceAdd'
      })

      /*****************************
       *****     Post Routes    ****
       *****************************/

      .state('post', {
        url: '/message/:postId',
        params: {
          postId: '_'
        },
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'ctlPost'
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
      })

      /*****************************
       *****   Search Routes    ****
       *****************************/

      .state('search', {
        url: '/search/:query',
        params: {
          query: '_'
        },
        templateUrl: 'app/search/search.html',
        controller: 'SearchController',
        controllerAs: 'ctlSearch'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
