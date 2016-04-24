(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, AuthService, WsService, NestedEvent, $scope, $log) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
      $location.path('/signin').replace();
    }

    vm.events = [];

    WsService.request('timeline/get_events', {
      skip: 0,
      limit: 150,
      after: 10,
      detail: 'full'
    }).then(function (data) {
      for (var key in data.events) {
        var eventData = data.events[key];
        var event = new NestedEvent(eventData);

        $log.debug("Event: ", event.type, event);
        $scope.events.events.push(event);
      }
    }).catch(function (data) {

    });
  }
})();
