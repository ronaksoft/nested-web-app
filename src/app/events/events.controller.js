(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, $scope, $q, $rootScope, $localStorage, $stateParams, $log, $uibModal, AuthService, WsService, WS_EVENTS, WS_ERROR, NestedEvent, NestedPlace, NestedInvitation, ngProgressFactory) {
    var vm = this;

      $scope.progressbar = ngProgressFactory.createInstance();

      $scope.progressbar.setHeight('5px');
      //$scope.progressbar.setColor('#14D766');

      $scope.progressbar.start();
      //$scope.progressbar.complete();


      $scope.setWidth = function(new_width, $event) {
        $scope.progressbar.set(new_width);
        $event.preventDefault();
      }

      $scope.startProgress = function($event) {
        $event.preventDefault();
        $scope.progressbar.start();
      }

      $scope.increment = function($event) {
        $event.preventDefault();
        $scope.progressbar.set($scope.progressbar.status() + 9);
      }

      $scope.new_color = function($event, color) {
        $event.preventDefault();
        $scope.progressbar.setColor(color);
      }

      $scope.new_height = function($event, new_height) {
        $event.preventDefault();
        $scope.progressbar.setHeight(new_height);
      }

      $scope.completeProgress = function($event) {
        $event.preventDefault();
        $scope.progressbar.complete();
      }

      $scope.stopProgress = function($event) {
        $event.preventDefault();
        $scope.progressbar.stop();
      }

      $scope.resetProgress = function($event) {
        $scope.progressbar.reset();
        $event.preventDefault();
      }

      $scope.start_contained = function($event) {
        $scope.contained_progressbar.start();
        $event.preventDefault();
      }

      $scope.complete_contained = function($event) {
        $scope.contained_progressbar.complete();
        $event.preventDefault();
      }

      $scope.reset_contained = function($event) {
        $scope.contained_progressbar.reset();
        $event.preventDefault();
      }

    //$scope.progressbar.height('2px');
    //ngProgress.color('black');
    $scope.progressbar.start();
    vm.extended = $localStorage.extended;
    vm.collapse = function () {
      if(vm.extended == true){
        $localStorage.extended = false;
        vm.extended = $localStorage.extended;
      }
      else{
        $localStorage.extended = true;
        vm.extended = $localStorage.extended;
      }
    };

    $scope.$store = $localStorage;
    $scope.$on('angular-resizable.resizeEnd', function (event, info) {
      $localStorage.sidebarWidth = info.width;
    });

    // Invitations

    vm.invitations = [];
    WsService.request('account/get_invitations').then(function (data) {
      for (var k in data.invitations) {
        if (data.invitations[k].place._id) {
          vm.invitations.push(new NestedInvitation(data.invitations[k]));
        }
      }
    })
    ;

    // /Invitations

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
          $scope.progressbar.complete();
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

    WsService.addEventListener(WS_EVENTS.AUTHORIZE, function (event) {
      // TODO: Get timeline events after last event
    });

    vm.load();

    $scope.postView = function (post, url, event) {
      $scope.progressbar.start();
      $scope.postViewModal = $uibModal.open({
        animation: false,
        templateUrl: 'app/post/post.html',
        controller: 'PostController',
        controllerAs: 'post',
        size: 'mlg',
        scope: $scope
      });

      $rootScope.$on('post-removed',function (context, post) {
        // FIXME: A post without any places should not exit logically, Make a decision for this case!
        if (post.places.length === 0) { //the post does not belong to a place anymore
          $scope.postViewModal.dismiss();
        }
      });

      $scope.thePost = post;
      $scope.thePost.load();
      $scope.lastUrl = $location.path();

      $scope.postViewModal.opened.then(function () {
        // $location.update_path(url, true);
        $scope.progressbar.complete();
      });

      $scope.postViewModal.closed.then(function () {
        // $location.update_path($scope.lastUrl, true);

        delete $scope.lastUrl;
        delete $scope.thePost;
      });

      event.stopPropagation();
    };

    $scope.attachmentView = function (attachment) {
      $scope.progressbar.start();
      return attachment.getDownloadUrl().then(function () {
        return $q(function (res) {
          res(this);
        }.bind(this));
      }.bind(attachment)).then(function (attachment) {
        $scope.lastUrl = $location.path();
        $scope.attachment = attachment;

        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/post/attachment.html',
          controller: 'AttachmentController',
          controllerAs: 'attachmentCtrl',
          size: 'mlg',
          windowClass: 'modal-attachment',
          scope: $scope
        });

        modal.opened.then(function () {
          // $location.update_path(attachment.download.url, true);
          $scope.progressbar.complete();
        });

        modal.closed.then(function () {
          // $location.update_path(attachment.download.lastUrl, true);

          delete $scope.lastUrl;
          delete $scope.attachment;
        });

        return $q(function (res) {
          res($scope.attachment);
        })
      });
    };
  }
})();
