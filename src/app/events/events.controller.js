(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, AuthService) {
    var vm = this;

    AuthService.isAuthenticated().catch(
      function () {
        $location.search({
          back: window.location.href
        });
        $location.path('/signin');
      }
    );
  }
})();
