(function() {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider, NST_DEFAULT) {

    $stateProvider
      .state('app', {
        abstract : true,
        templateUrl : 'app/app-layout.html',
        controller : 'AppController',
        controllerAs : 'ctlApp'
      })

      /*****************************
       *****    User Routes     ****
       *****************************/

      .state('app.profile', {
        url: '/profile',
        templateUrl: 'app/pages/account/profile-edit/profile-edit.html',
        controller: 'ProfileEditController',
        controllerAs: 'ctlProfileEdit',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })
      .state('app.change-password', {
        url: '/change-password',
        templateUrl: 'app/pages/account/change-password/change-password.html',
        controller: 'ChangePasswordController',
        controllerAs: 'ctlPass',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })

      /*****************************
       *****   Compose Routes   ****
       *****************************/

      .state('app.compose', {
        url: '/compose',
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },

      })
      .state('app.place-compose', {
        url: '/compose/:placeId',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })
      .state('app.compose-forward', {
        url: '/forward/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })
      .state('app.compose-reply-all', {
        url: '/reply/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })
      .state('app.compose-reply-sender', {
        url: '/reply/:postId/sender',
        params: {
          postId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/compose/main.html',
        controller: 'ComposeController',
        controllerAs: 'ctlCompose',
        resolve: {
          PreviousState: [
            "$state",
            function ($state) {
              var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
              };
              return currentStateData;
            }
          ]
        },
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('app.place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/places/settings/place-settings.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlSettings'
      })
      .state('app.place-add', {
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

      .state('app.post', {
        url: '/message/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          post: {}
        },
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'ctlPost'
      })
      .state('app.place-post', {
        url: '/place/:placeId/message/:postId',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
          post: {}
        },
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'ctlPost'
      })
      .state('app.message-chain', {
        url: '/message/:postId/chain',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
        },
        templateUrl: 'app/chain/message-chain.html',
        controller: 'MessageChainController',
        controllerAs: 'ctlChain'
      })
      .state('app.place-message-chain', {
        url: '/place/:placeId/message/:postId/chain',
        params: {
          postId: NST_DEFAULT.STATE_PARAM,
        },
        templateUrl: 'app/chain/message-chain.html',
        controller: 'MessageChainController',
        controllerAs: 'ctlChain'
      })

      /*****************************
       *****  Activity Routes   ****
       *****************************/

      .state('app.app.activity', {
        url: '/activity',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('app.activity-bookmarks', {
        url: '/activity/bookmarks',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('app.activity-bookmarks-filtered', {
        url: '/activity/bookmarks/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('app.activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('app.place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity'
      })
      .state('app.place-activity-filtered', {
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

      .state('app.messages', {
        url: '/messages',
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.messages-bookmarks', {
        url: '/messages/bookmarks',
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.messages-bookmarks-sorted', {
        url: '/messages/bookmarks/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.messages-sent', {
        url: '/messages/sent',
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.messages-sent-sorted', {
        url: '/messages/sent/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.messages-sorted', {
        url: '/messages/:sort',
        params: {
          sort: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.place-messages', {
        url: '/places/:placeId/messages',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/main.html',
        controller: 'MessagesController',
        controllerAs: 'ctlMessages'
      })
      .state('app.place-messages-sorted', {
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

      .state('app.search', {
        url: '/search/:query',
        params: {
          query: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/messages/search/search.html',
        controller: 'SearchController',
        controllerAs: 'ctlSearch'
      });

    $urlRouterProvider.otherwise('/signin');
  }

})();
