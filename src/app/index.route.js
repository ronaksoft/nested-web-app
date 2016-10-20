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
        controllerAs : 'ctlApp',
        params : {
          postId : null,
        }
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
        options : {
          group : 'compose',
          primary : true
        }
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
        options : {
          group : 'compose',
          primary : true
        }
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
        options : {
          group : 'compose',
          primary : true
        }
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
        options : {
          group : 'compose',
          primary : true
        }
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
        options : {
          group : 'compose',
          primary : true
        }
      })

      /*****************************
       *****   Places Routes    ****
       *****************************/

      .state('app.place-settings', {
        url: '/places/:placeId/settings',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          openCreatePlace : null
        },
        templateUrl: 'app/pages/places/settings/place-settings.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlSettings',
        options : {
          primary : true,
          group : 'settings'
        }
      })
      .state('app.place-add', {
        url: '/places/:placeId/add',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/pages/places/add/main.html',
        controller: 'PlaceAddController',
        controllerAs: 'ctlPlaceAdd',
        options : {
          group : 'settings'
        }
      })
      .state('app.place-create', {
        url: '/places/:placeId/create',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        options : {
          group : 'settings'
        },
        onEnter: ['$stateParams', '$state', '$uibModal', 'previousState', function($stateParams, $state, $uibModal, previousState) {
          var modal = $uibModal.open({
            animation: false,
            size: 'lg-white',
            templateUrl: 'app/place/create/create-team.html',
            controller: 'PlaceCreateController',
            controllerAs: 'ctlCreate'
          }).result.then(function() {
            if (previousState.name) {
              $state.go(previousState.name, previousState.params, { notify : false });
            }
          }, function() {
            if (previousState.name) {
              $state.go(previousState.name, previousState.params, { notify : false });
            }
          });
        }],
        onExit: function($uibModalStack) {
          if ($uibModalStack) {
            $uibModalStack.dismissAll();
          }
        },
        resolve: {
          previousState : [
            "$state",
            function ($state) {
              var current = {
                name : $state.current.name,
                params : $state.params,
                url : $state.href($state.current.name, $state.params)
              };
              return current;
            }
          ]
        },
      })

      /*****************************
       *****  Activity Routes   ****
       *****************************/

      .state('app.activity', {
        url: '/activity',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-bookmarks', {
        url: '/activity/bookmarks',
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-bookmarks-filtered', {
        url: '/activity/bookmarks/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.activity-filtered', {
        url: '/activity/:filter',
        params: {
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.place-activity', {
        url: '/places/:placeId/activity',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
      })
      .state('app.place-activity-filtered', {
        url: '/places/:placeId/activity/:filter',
        params: {
          placeId: NST_DEFAULT.STATE_PARAM,
          filter: NST_DEFAULT.STATE_PARAM
        },
        templateUrl: 'app/events/events.html',
        controller: 'ActivityController',
        controllerAs: 'ctlActivity',
        options : {
          primary : true,
          group : 'activity'
        }
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
        controllerAs: 'ctlSearch',
        options : {
          group : 'message'
        }
      });

    $urlRouterProvider.otherwise('/signin');
  }

})();
