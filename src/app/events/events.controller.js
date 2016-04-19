(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, WsService, AuthService) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    WsService.request('timeline/get_events', {
      skip: 0,
      limit: 1,
      after: 10
    }).then(function (data) {

    }).catch(function (data) {
      console.log(data);
    });
  }
})();
