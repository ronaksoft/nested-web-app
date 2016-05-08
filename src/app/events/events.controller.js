(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, AuthService, WsService, NestedEvent, NestedPlace, $scope, $stateParams, $uibModal) {
    var vm = this;

    if (!AuthService.isAuthenticated()) {
      $location.search({
        back: $location.$$absUrl
      });
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

    vm.place = new NestedPlace($stateParams.placeId ? { id: $stateParams.placeId } : undefined);
    vm.placeAncestors = $stateParams.placeId ? $stateParams.placeId.split('.') : undefined;
    vm.filter = $stateParams.filter;

    vm.parameters = {
      skip: 0,
      limit: 25,
      after: 0,
      details: 'full'
    };

    if (vm.filters.hasOwnProperty(vm.filter)) {
      vm.parameters['filter'] = vm.filters[vm.filter].filter;
    }

    if (vm.place.id) {
      vm.parameters['place_id'] = vm.place.id;
    }

    vm.load = function () {
      WsService.request('timeline/get_events', vm.parameters).then(function (data) {
        var now = $scope.events.today;
        $scope.events.moreEvents = !(data.events.length < $scope.events.parameters.limit);
        $scope.events.parameters.skip += data.events.length;

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
    };

    vm.scroll = function (event) {
      var element = event.currentTarget;
      if (element.scrollTop + element.clientHeight === element.scrollHeight && this.moreEvents) {
        this.load();
      }
    };

    vm.load();

    $scope.postView = function (post, url) {
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        size: 'lg',
        scope: $scope
      });

      $scope.thePost = post;
      $scope.thePost.load();
      $scope.thePost.loadComments();
      $scope.lastUrl = $location.path();

      modal.opened.then(function () {
        // $location.update_path(url, true);
      });

      modal.closed.then(function () {
        // $location.update_path($scope.lastUrl, true);

        delete $scope.lastUrl;
        delete $scope.thePost;
      });
    };

    $scope.attachmentView = function (attachment) {
      $scope.attachment = attachment;

      attachment.download.getUrl().then(function (url) {
        $scope.lastUrl = $location.path();

        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/post/attachment.html',
          controller: 'AttachmentController',
          size: 'lg',
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
