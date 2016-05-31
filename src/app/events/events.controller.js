(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, $scope, $rootScope, $stateParams, $uibModal, AuthService, WsService, WS_EVENTS, WS_ERROR, NestedEvent, NestedPlace) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.moreEvents = true;
    vm.eventGroups = {};
    vm.gformats = {
      daily: 'EEEE d MMM',
      monthly: 'MMMM',
      yearly: 'yyyy'
    };
    vm.today = new Date(Date.now());

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

    if (vm.filters.hasOwnProperty($stateParams.placeId)) {
      $stateParams.filter = $stateParams.placeId;
      $stateParams.placeId = null;
    }

    vm.place = new NestedPlace($stateParams.placeId ? $stateParams.placeId : undefined);
    vm.placeAncestors = $stateParams.placeId ? $stateParams.placeId.split('.') : undefined;
    vm.filter = $stateParams.filter;

    vm.parameters = {
      skip: 0,
      limit: 25,
      details: 'full'
    };

    if (vm.filters.hasOwnProperty(vm.filter)) {
      vm.parameters['filter'] = vm.filters[vm.filter].filter;
    }

    if (vm.place.id) {
      vm.parameters['place_id'] = vm.place.id;
    }

    vm.pushEvent = function (event, appendFirst) {
      var now = $rootScope.now;

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

      if (appendFirst) {
        $scope.events.eventGroups[gkey].set.unshift(event);
      } else {
        $scope.events.eventGroups[gkey].set.push(event);
      }
    };

    vm.load = function () {
      WsService.request('timeline/get_events', vm.parameters).then(function (data) {
        $scope.events.moreEvents = !(data.events.length < $scope.events.parameters.limit);
        $scope.events.parameters.skip += data.events.length;

        for (var key in data.events) {
          var eventData = data.events[key];
          var event = new NestedEvent(eventData);

          $scope.events.pushEvent(event);
        }
      }).catch(function (data) {
        switch (data.err_code) {
          case WS_ERROR.UNAVAILABLE:
          case WS_ERROR.INVALID:
          case WS_ERROR.ACCESS_DENIED:
            $location.path('/').replace();
            break;
        }

      });
    };

    vm.scroll = function (event) {
      var element = event.currentTarget;
      if (element.scrollTop + element.clientHeight + 10 > element.scrollHeight && this.moreEvents) {
        this.load();
      }
    };

    WsService.addEventListener(WS_EVENTS.TIMELINE, function (tlEvent) {
      var event = new NestedEvent(tlEvent.detail.timeline_data);
      $scope.events.pushEvent(event, true);
    });

    vm.load();

    $scope.postView = function (post, url, event) {
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        size: 'mlg',
        scope: $scope
      });

      $scope.thePost = post;
      $scope.thePost.load();
      $scope.lastUrl = $location.path();

      modal.opened.then(function () {
        // $location.update_path(url, true);
      });

      modal.closed.then(function () {
        // $location.update_path($scope.lastUrl, true);

        delete $scope.lastUrl;
        delete $scope.thePost;
      });

      event.stopPropagation();
    };

    $scope.attachmentView = function (attachment, event) {
      $scope.attachment = attachment;

      attachment.download.getUrl().then(function (url) {
        $scope.lastUrl = $location.path();

        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/post/attachment.html',
          controller: 'AttachmentController',
          size: 'mlg',
          windowClass: 'modal-attachment',
          scope: $scope
        });

        modal.opened.then(function () {
          // $location.update_path(attachment.download.url, true);
        });

        modal.closed.then(function () {
          // $location.update_path(attachment.download.lastUrl, true);

          delete $scope.lastUrl;
          delete $scope.attachment;
        });
      });
    };
  }
})();
