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
      .state('places', {
        url: '/places',
        templateUrl: 'app/places/places.html',
        controller: 'PlacesController',
        controllerAs: 'places'
      })
      .state('create-place', {
        url: '/create-place',
        templateUrl: 'app/create_place/create_place.html',
        controller: 'CreatePlaceController',
        controllerAs: 'create_place'
      })
      .state('events', {
        url: '/events',
        templateUrl: 'app/events/events.html',
        controller: 'EventsController',
        controllerAs: 'events'
      })
      .state('post', {
        url: '/post',
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'post'
      })
      .state('compose', {
        url: '/compose',
        templateUrl: 'app/compose/compose.html',
        controller: 'ComposeController',
        controllerAs: 'compose'
      })
      .state('place', {
        url: '/place/:placeId',
        templateUrl: 'app/places/option/place_option.html',
        controller: 'PlaceOptionController',
        controllerAs: 'place_option'
      });


    $urlRouterProvider.otherwise('/');
  }

})();
