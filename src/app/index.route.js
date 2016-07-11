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
        controllerAs: 'main'
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'app/login/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .state('signout', {
        url: '/signout',
        controller: 'LogoutController',
        controllerAs: 'logout'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/register/register.html',
        controller: 'RegisterController',
        controllerAs: 'register'
      })
      .state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'app/reset_password/reset_password.html',
        controller: 'ResetPasswordController',
        controllerAs: 'reset_password'
      })
      .state('messages', {
        url: '/messages',
        params: {
          placeId: null,
          filter: '!$all'
        },
        templateUrl: 'app/messages/messages.html',
        controller: 'MessagesController',
        controllerAs: 'messages'
      })
      .state('activity', {
        url: '/activity',
        params: {
          placeId: null,
          filter: '!$all'
        },
        templateUrl: 'app/events/events.html',
        controller: 'EventsController',
        controllerAs: 'events'
      })
      .state('events-filtered-1d', {
        url: '/activity/:placeId',
        params: {
          placeId: null,
          filter: '!$all'
        },
        templateUrl: 'app/events/events.html',
        controller: 'EventsController',
        controllerAs: 'events'
      })
      .state('events-filtered-2d', {
        url: '/activity/:placeId/:filter',
        params: {
          placeId: null,
          filter: '!$all'
        },
        templateUrl: 'app/events/events.html',
        controller: 'EventsController',
        controllerAs: 'events'
      })
      .state('places', {
        url: '/places',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/places/places.html',
        controller: 'PlacesController',
        controllerAs: 'places'
      })
      .state('places-filtered', {
        url: '/places/:filter',
        params: {
          filter: '!$all'
        },
        templateUrl: 'app/places/places.html',
        controller: 'PlacesController',
        controllerAs: 'places'
      })
      .state('place', {
        url: '/place/:placeId',
        templateUrl: 'app/places/option/place_option.html',
        controller: 'PlaceOptionController',
        controllerAs: 'place_option'
      })
      .state('create-place', {
        url: '/create_place',
        params: {
          placeId: null
        },
        templateUrl: 'app/create_place/create_place.html',
        controller: 'CreatePlaceController',
        controllerAs: 'create_place'
      })
      .state('create-subplace', {
        url: '/create_place/:placeId',
        params: {
          placeId: null
        },
        templateUrl: 'app/create_place/create_place.html',
        controller: 'CreatePlaceController',
        controllerAs: 'create_place'
      })
      .state('post', {
        url: '/post/:postId',
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'post'
      })
      .state('new', {
        url: '/new',
        params: {
          relation: null
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'compose'
      })
      .state('new-related', {
        url: '/new/:relation',
        params: {
          relation: null
        },
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'compose'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'AccountProfileController',
        controllerAs: 'account_profile'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
