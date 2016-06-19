(function() {
  'use strict';

  angular
    .module('nested')
    .controller('EventsController', EventsController);

  /** @ngInject */
  function EventsController($location, $scope, $q, $rootScope, CacheFactory, $stateParams, $log, $uibModal,
                            AuthService, WsService, WS_EVENTS, WS_ERROR, LoaderService,
                            NestedEvent, NestedPlace, NestedInvitation) {
    var vm = this;

    var extendedCache;

    if (!CacheFactory.get('extended')) {
      CacheFactory.createCache('extended', {storageMode: 'localStorage'});
      extendedCache = CacheFactory.get('extended');
      extendedCache.put('v', {
        status: true
      });
      vm.extended = extendedCache.get('v').status;
    } else {
      extendedCache = CacheFactory.get('extended');
      vm.extended = extendedCache.get('v').status;
    }

     vm.collapse = function () {
      if(vm.extended == true){
        extendedCache.put('v', {
          status: false
        });
        vm.extended = extendedCache.get('v').status;
      }
      else{
        extendedCache.put('v', {
          status: true
        });
        vm.extended = extendedCache.get('v').status;
      }
    };

    if (!CacheFactory.get('filterStat')) {
      CacheFactory.createCache('filterStat', {storageMode: 'localStorage'});
      var filterStatCache = CacheFactory.get('filterStat');
      filterStatCache.put('v', {
        status: "!$all"
      });
      $scope.filterStatus = "!$" + filterStatCache.get('v').status
    } else {
      var filterStatCache = CacheFactory.get('filterStat');
      $scope.filterStatus = "!$" + filterStatCache.get('v').status
    }

    vm.setFilter = function (stat) {
      filterStatCache.put('v', {
        status: stat
      });
      $scope.filterStatus = "!$" + filterStatCache.get('v').status
    };

    if (!CacheFactory.get('sidebarWidth')) {
      CacheFactory.createCache('sidebarWidth', {storageMode: 'localStorage'});
      var sidebarWidthCache = CacheFactory.get('sidebarWidth');
      sidebarWidthCache.put('v', {
        width: 222
      });
      $scope.sidebarWidth = sidebarWidthCache.get('v').width;
    }else {
      var sidebarWidthCache = CacheFactory.get('sidebarWidth');
      $scope.sidebarWidth = sidebarWidthCache.get('v').width;
    }

    $scope.$on('angular-resizable.resizeEnd', function (event, info) {
     sidebarWidthCache.put('v', {
     width: info.width
     });
    $scope.sidebarWidth = sidebarWidthCache.get('v').width;
    });

    if (!AuthService.isAuthenticated()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

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
            $location.path('/').replace();
            break;
        }

      }).finally(function () {
        vm.readyToLoad = true;
      }));
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
