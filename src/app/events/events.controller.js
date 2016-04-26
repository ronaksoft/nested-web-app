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

    vm.eventGroups = {};
    vm.gformats = {
      daily: 'EEEE d MMM',
      monthly: 'MMMM',
      yearly: 'yyyy'
    };
    vm.today = new Date(Date.now());

    WsService.request('timeline/get_events', {
      skip: 0,
      limit: 150,
      after: 10,
      detail: 'full'
    }).then(function (data) {
      var now = $scope.events.today;

      for (var key in data.events) {
        var eventData = data.events[key];
        var event = new NestedEvent(eventData);

        var gkey = null,
          gtype = null;
        if (now.getFullYear() === event.date.getFullYear()) {
          if (now.getMonth() === event.date.getMonth()) {
            gtype = 'daily';
            gkey = gtype + '-' + event.date.getDay();
          } else {
            gtype = 'monthly';
            gkey = gtype + '-' + event.date.getMonth();
          }
        } else {
          gtype = 'yearly';
          gkey = gtype + '-' + event.date.getFullYear();
        }

        if (!$scope.events.eventGroups.hasOwnProperty(gkey)) {
          $scope.events.eventGroups[gkey] = {
            titleFormat: $scope.events.gformats[gtype],
            type: gtype,
            date: event.date,
            set: []
          };
        }

        $scope.events.eventGroups[gkey].set.push(event);
      }
    }).catch(function (data) {

    });
  }
})();
