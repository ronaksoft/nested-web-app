(function() {
  'use strict';

  angular
    .module('nested')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {
    $stateProvider
      /*****************************
       *****   Public Routes    ****
       *****************************/

      .state('intro', {
        url: '/',
        templateUrl: 'app/pages/intro/main.html',
        controller: 'IntroController',
        controllerAs: 'ctlIntro'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'app/user/register/main.html',
        controller: 'RegisterController',
        controllerAs: 'ctlRegister'
      })

      /*****************************
       *****     Auth Routes    ****
       *****************************/

      .state('signin', {
        url: '/signin',
        templateUrl: 'app/user/login/main.html',
        controller: 'LoginController',
        controllerAs: 'ctlLogin'
      })
      .state('signin-back', {
        url: '/signin/:back',
        params: {
          back: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/user/login/main.html',
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
        templateUrl: 'app/pages/account/profile/edit/main.html',
        controller: 'ProfileEditController',
        controllerAs: 'ctlProfileEdit'
      })

      /*****************************
       *****   Compose Routes   ****
       *****************************/

      .state('compose', {
        url: '/compose',
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('place-compose', {
        url: '/compose/:placeId',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-forward', {
        url: '/forward/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-reply-all', {
        url: '/reply/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })
      .state('compose-reply-sender', {
        url: '/reply/:postId/sender',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose'
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/places/settings/main.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlPlaceSettings'
      })
      .state('place-add', {
        url: '/places/:placeId/add',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/places/add/main.html',
        controller: 'PlaceAddController',
        controllerAs: 'ctlPlaceAdd'
      })

      /*****************************
       *****     Post Routes    ****
       *****************************/

      .state('post', {
        url: '/message/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          post: {}
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
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('place-activity-filtered', {
        url: '/places/:placeId/activity/:filter',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          filter: NST_DEFAULT.STATE_PARAM
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
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-bookmarks', {
        url: '/messages/bookmarks',
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-bookmarks-sorted', {
        url: '/messages/bookmarks/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sent', {
        url: '/messages/sent',
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sent-sorted', {
        url: '/messages/sent/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('messages-sorted', {
        url: '/messages/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('place-messages-sorted', {
        url: '/places/:placeId/messages/:sort',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })

      /*****************************
       *****   Search Routes    ****
       *****************************/

      .state('search', {
        url: '/search/:query',
        params: {
          query: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/search/search.html',
        controller: 'SearchController',
        controllerAs: 'ctlSearch'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
