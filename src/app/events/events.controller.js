(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, AuthService, WsService, NestedEvent, $scope, $stateParams, $log) {
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
    vm.filter = $stateParams.filter;
    vm.filters = {
      '!$all': {
        filter: 'all',
        name: 'All'
      },
      '!$inbox': {
        filter: 'inbox',
        name: 'Inbox'
      },
      '!$comments': {
        filter: 'comments',
        name: 'Comments'
      },
      '!$members': {
        filter: 'members',
        name: 'Member Acts'
      },
      '!$place': {
        filter: 'places',
        name: 'Place Acts'
      }
    };

    var parameters = {
      skip: 0,
      limit: 10,
      after: 0,
      details: 'full'
    };

    if (vm.filters.hasOwnProperty(vm.filter)) {
      parameters['filter'] = vm.filters[vm.filter].filter;
    } else {
      parameters['place_id'] = vm.filter;
    }

    WsService.request('timeline/get_events', parameters).then(function (data) {
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
