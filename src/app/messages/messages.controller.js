(function() {
  'use strict';

  angular
    .module('nested')
    .controller('MessagesController', MessagesController);

  /** @ngInject */
  function MessagesController($location, $scope, $q, $rootScope, $stateParams, $log, $timeout, $uibModal,
    toastr, AuthService, WsService, NstSvcLoader,
    NST_WS_EVENT, NST_EVENT_ACTION, NST_WS_ERROR, NST_STORAGE_TYPE,
    NstSvcStorageFactory, NstSvcActivityFactory, NstSvcPlaceFactory, NstSvcInvitationFactory) {
    var vm = this;

    console.log('here in messages');

    if (!AuthService.isInAuthorization()) {
      $location.search({ back: $location.path() });
      $location.path('/signin').replace();
    }

    vm.srch = function () {
      console.log(arguments);
      for (var i = 0; i < arguments.length; i++) {
        var id = arguments[i];
        var e = document.getElementById(id);
        console.log(e);
        if (e.style.display == 'block')
          e.style.display = 'none';
        else {
          e.style.display = 'block';
        }
      }
    };

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

    vm.place = NstSvcPlaceFactory.get($stateParams.placeId ? $stateParams.placeId : undefined);
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
      var now = $rootScope.now();

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



    WsService.addEventListener(NST_WS_EVENT.TIMELINE, function (tlEvent) {
      var event = new NestedEvent(tlEvent.detail.timeline_data);
      $log.debug(event);
      var action = tlEvent.detail.timeline_data.action;
      var filter = vm.filters[vm.filter].filter;

      if (shouldPushToEvents(filter, action)) {
          $scope.events.pushEvent(event, true);
      }
    });

    WsService.addEventListener(NST_WS_EVENT.AUTHORIZE, function (event) {
      // TODO: Get timeline events after last event
    });

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
        if (post.places.length === 0) {
          $scope.postViewModal.dismiss();
          // FIXME: I do not know why it takes a while to disappear!
          removePostEvent(post.id);
        }
      });

      $scope.thePost = post;
      NstSvcLoader.inject($scope.thePost.load());
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
      return NstSvcLoader.inject(attachment.getDownloadUrl().then(function () {
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

    function shouldPushToEvents(filter, action){
      var views = [
        {
          key: 'all',
          actions : _.values(EVENT_ACTIONS)
        },
        {
          key: 'inbox',
          actions : [
            EVENT_ACTIONS.POST_ADD,
            EVENT_ACTIONS.POST_REMOVE,
            EVENT_ACTIONS.POST_UPDATE
          ]
        },
        {
          key: 'comments',
          actions : [
            EVENT_ACTIONS.COMMENT_ADD,
            EVENT_ACTIONS.COMMENT_REMOVE
          ]
        },
        {
          key: 'acts',
          actions : [
            EVENT_ACTIONS.MEMBER_ADD,
            EVENT_ACTIONS.MEMBER_REMOVE,
            EVENT_ACTIONS.MEMBER_INVITE,
            EVENT_ACTIONS.MEMBER_JOIN,
            EVENT_ACTIONS.PLACE_ADD,
            EVENT_ACTIONS.PLACE_REMOVE,
            EVENT_ACTIONS.PLACE_PRIVACY,
            EVENT_ACTIONS.PLACE_PICTURE
          ]
        },
      ];

      // returns true if the event belongs to the selected view and is one of its actions
      return _.some(views, function (view) {
        return view.key === filter && _.includes(view.actions, action);
      });
    }

    function removePostEvent(id) {
      if (!id) { return; }

      _.forEach(vm.eventGroups, function (group) {
        var postEvent = _.find(group.set, function (event) {
          return event.post && event.post.id === id;
        });
        if (postEvent){
          group.set.splice(group.set.indexOf(postEvent), 1);
          return;
        }
      });
    }
    // TODO: ask Ali about the below line
    // $("#popover").popover({ trigger: "hover" });
  }

})();
