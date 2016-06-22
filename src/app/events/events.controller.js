(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, $scope, $q, $rootScope, $stateParams, $log, $uibModal,
                            AuthService, WsService, WS_EVENTS, WS_ERROR, STORAGE_TYPE,
                            LoaderService, StorageFactoryService,
                            NestedEvent, NestedPlace, NestedInvitation) {
    var vm = this;

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    var storage = StorageFactoryService.create('ui.pages.activity', STORAGE_TYPE.LOCAL);
    storage.get("extended").catch(function () {
      var defValue = false;
      storage.put("extended", defValue);

      return $q(function (res) {
        res(defValue);
      });
    }).then(function (value) {
      vm.extended = value;
    });

    vm.collapse = function () {
      vm.extended =! vm.extended;
      storage.put("extended", vm.extended);
    };

    storage.get("filterStat").catch(function () {
      var defValue = 'all';
      storage.put("extended", defValue);

      return $q(function (res) {
        res(defValue);
      });
    }).then(function (value) {
      $scope.filterStatus = "!$" + value;
    });

    vm.setFilter = function (stat) {
      storage.put("filterStat", stat);
    };

    storage.get("sidebarWidth").catch(function () {
      var defValue = 222;
      storage.put("extended", defValue);

      return $q(function (res) {
        res(defValue);
      });
    }).then(function (value) {
      $scope.sidebarWidth = value;
    });

    $scope.$on('angular-resizable.resizeEnd', function (event, info) {
      storage.put("sidebarWidth", info.width);
    });

    // Invitations
    vm.invitations = [];
    LoaderService.inject(WsService.request('account/get_invitations').then(function (data) {
      for (var k in data.invitations) {
        if (data.invitations[k].place._id) {
          vm.invitations.push(new NestedInvitation(data.invitations[k]));
        }
      }

      return $q(function (res) {
        res();
      });
    }));

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
      LoaderService.inject(WsService.request('timeline/get_events', vm.parameters).then(function (data) {
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
            vm.noAccessModal();
            //$location.path('/').replace();
            break;
        }

      }).finally(function () {
        vm.readyToLoad = true;
      }));
    };
    vm.noAccessModal = function (user) {
      $scope.member = user;

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/events/noaccess.html',
        controller: 'WarningController',
        size: 'sm',
        scope: $scope
      }).result.then(function () {
        return $location.path('/').replace();
      });
    };

    vm.readyToLoad = true;
    vm.scroll = function (event) {
      var element = event.currentTarget;
      if (element.scrollTop + element.clientHeight + 10 > element.scrollHeight && this.moreEvents) {
        console.log(vm.readyToLoad);

        if (vm.readyToLoad) {
          vm.readyToLoad = false;
          this.load();
        }
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
      LoaderService.inject($scope.thePost.load());
      $scope.lastUrl = $location.path();

      $scope.postViewModal.opened.then(function () {
        // $location.update_path(url, true);
      });

      $scope.postViewModal.closed.then(function () {
        // $location.update_path($scope.lastUrl, true);

        delete $scope.lastUrl;
        delete $scope.thePost;
      });

      event.stopPropagation();
    };

    $scope.attachmentView = function (attachment) {
      return LoaderService.inject(attachment.getDownloadUrl().then(function () {
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
        });

        modal.closed.then(function () {
          // $location.update_path(attachment.download.lastUrl, true);

          delete $scope.lastUrl;
          delete $scope.attachment;
        });

        return $q(function (res) {
          res($scope.attachment);
        })
      }));
    };
  }
})();
