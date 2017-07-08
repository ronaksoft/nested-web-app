(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostCardController', PostCardController)

  function PostCardController($state, $log, $timeout, $stateParams, $rootScope, $scope, $filter, $window, $sce, $uibModal,
                              _, moment, toastr,
                              NST_EVENT_ACTION, NST_PLACE_ACCESS, NST_POST_EVENT, SvcCardCtrlAffix,
                              NstSvcSync, NstVmFile, NstSvcPostFactory, NstSvcPlaceFactory,
                              NstSvcAuth, NstUtility, NstSvcPostInteraction, NstSvcTranslation, NstSvcLogger) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentsSettings = {
        limit: 8,
        date: null
      },
      chaingStack = [],
      newCommentIds = [],
      unreadCommentIds = [],
      focusOnSentTimeout = null,
      eventReferences = [];

    vm.remove = _.partial(remove, vm.post);
    vm.toggleRemoveFrom = toggleRemoveFrom;
    vm.retract = retract;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.showTrustedBody = showTrustedBody;
    vm.markAsRead = markAsRead;
    vm.switchToPostCard = switchToPostCard;
    vm.onAddComment = onAddComment;
    vm.replyAll = replyAll;
    vm.forward = forward;
    vm.replyToSender = replyToSender;
    vm.viewFull = viewFull;
    vm.setBookmark = setBookmark;
    vm.loadNewComments = loadNewComments;
    vm.attachPlace = attachPlace;
    vm.toggleRecieveNotification = toggleRecieveNotification;
    vm.seenBy = seenBy;
    vm.move = move;
    vm.watched = false;
    vm.toggleMoveTo = toggleMoveTo;

    vm.expandProgress = false;
    vm.body = null;
    vm.chainView = false;
    vm.unreadCommentsCount = 0;
    vm.isChecked = false;
    vm.isCheckedForce = false;
    // vm.isPlaceFilter = false;

    isPlaceFeed();
    $scope.$parent.$parent.affixObserver = 1;

    vm.getPlacesWithRemoveAccess = getPlacesWithRemoveAccess;
    vm.getPlacesWithControlAccess = getPlacesWithControlAccess;
    vm.hasPlacesWithControlAccess = hasPlacesWithControlAccess;
    vm.hasDeleteAccess = hasDeleteAccess;
    vm.hasHiddenCommentAccess = hasPlacesWithControlAccess();

    if (vm.mood === 'chain') {
      vm.chainView = true;
    }

    function replyAll($event) {
      $event.preventDefault();
      $state.go('app.compose-reply-all', {postId: vm.post.id}, {notify: false});
    }

    function forward($event) {
      $event.preventDefault();
      $state.go('app.compose-forward', {postId: vm.post.id}, {notify: false});
    }

    function replyToSender($event) {
      $event.preventDefault();
      $state.go('app.compose-reply-sender', {postId: vm.post.id}, {notify: false});
    }

    function viewFull($event) {
      markAsRead();
      $event.preventDefault();
      if ($state.current.name !== 'app.message') {
        $state.go('app.message', {postId: vm.post.id, trusted: vm.trusted}, {notify: false});
      } else {
        var reference = $scope.$emit('post-view-target-changed', {postId: vm.post.id});
        eventReferences.push(reference);
      }
    }

    function toggleRecieveNotification() {
      vm.watched =! vm.watched;
      NstSvcPostFactory.setNotification(vm.post.id, vm.watched);
    }


    function markAsRead() {
      if (!vm.post.read) {
        vm.post.read = true;
        NstSvcPostFactory.read(vm.post.id).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
      }
    }

    function setBookmark(setBookmark) {
      vm.post.pinned = setBookmark;
      if (setBookmark) {
        NstSvcPostFactory.pin(vm.post.id).catch(function () {
          vm.post.pinned = !setBookmark;
        });
      } else {
        NstSvcPostFactory.unpin(vm.post.id).catch(function () {
          vm.post.pinned = !setBookmark;
        });
      }
    }

    function remove(post, place) {
      confirmforRemove(post, place).then(function (agree) {
        if (!agree) {
          return;
        }

        NstSvcPostFactory.remove(post.id, place.id).then(function () {
          NstUtility.collection.dropById(post.places, place.id);
          toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from Place {0}."), place.name));
          $rootScope.$broadcast('post-removed', {
            postId: post.id,
            placeId: place.id
          });
          vm.isChecked = false;
          $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
        });
      });
    }

    function toggleRemoveFrom(show) {
      vm.showRemoveFrom = show;
    }

    function confirmforRemove(post, place) {
      return $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/remove-from-confirm.html',
        controller: 'RemoveFromConfirmController',
        controllerAs: 'ctrl',
        resolve: {
          post: function () {
            return post;
          },
          place: function () {
            return place;
          }
        }
      }).result;
    }

    function retract() {
      vm.retractProgress = true;
      NstSvcPostInteraction.retract(vm.post).finally(function () {
        vm.retractProgress = false;
        vm.isChecked = false;
        $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
      });
    }

    function expand() {
      vm.expandProgress = true;
      NstSvcPostFactory.get(vm.post.id, true).then(function (post) {
        vm.expandProgress = false;
        vm.orginalPost = post;
        vm.body = post.body;
        vm.resources = post.resources;
        vm.isExpanded = true;
        if (!post.read) {
          markAsRead();
        }

        if (vm.post.trusted || Object.keys(post.resources).length == 0) {
          showTrustedBody();
        }
        ++$scope.$parent.$parent.affixObserver;
        SvcCardCtrlAffix.change();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
      }).finally(function () {
        vm.expandProgress = false;
      });
    }

    function collapse(e) {
      if (vm.post.ellipsis) {
        var el = angular.element(e.currentTarget);
        var elParent = el.parents('post-card')[0];
        var elParentH = el.parents('post-card').height();
        var postCardOffTOp = elParent.offsetTop;
        var scrollOnCollapseCase = document.documentElement.clientHeight < elParentH;
        var postCollaspeTimeout = scrollOnCollapseCase ? 300 : 0;
        if (scrollOnCollapseCase) {
          $timeout(function(){
            SvcCardCtrlAffix.change();
          },300)
          $('html, body').animate({
            scrollTop: postCardOffTOp
          }, 300, 'swing', function () {
          });
        }
        $timeout(function () {
          vm.isExpanded = false;
          vm.body = vm.post.body;
        }, postCollaspeTimeout)
      } else {
        vm.body = vm.post.body;
        vm.isExpanded = false;
        SvcCardCtrlAffix.change();
      }


    }

    function attachPlace() {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/attach-place.html',
        controller: 'AttachPlaceController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          },
          postPlaces: function () {
            return vm.post.places;
          }
        }
      }).result.then(function (attachedPlaces) {
        _.forEach(attachedPlaces, function (place) {
          if (!_.some(vm.post.places, {id: place.id})) {
            vm.post.places.push(place);
          }
        });

        NstSvcPlaceFactory.getAccess(_.map(attachedPlaces, 'id')).then(function (accesses) {
          _.forEach(accesses, function (item) {
            var postPlace = _.find(vm.post.places, {id: item.id});
            if (postPlace) {
              postPlace.accesses = item.accesses;
            }
          });
        });

      });
    }

    function seenBy() {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/seen-by.html',
        controller: 'SeenByController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          }
        }
      }).result.then(function () {});
    }

    function move(selectedPlace) {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/messages/partials/modals/move.html',
        controller: 'MovePlaceController',
        controllerAs: 'ctrl',
        resolve: {
          postId: function () {
            return vm.post.id;
          },
          selectedPlace: function () {
            return selectedPlace;
          },
          postPlaces: function () {
            return vm.post.places;
          },
          multi : false
        }
      }).result.then(function (result) {
        $scope.$emit('post-moved', {
          postId: vm.post.id,
          toPlace: result.toPlace,
          fromPlace: result.fromPlace
        });
        vm.isChecked = false;
        $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
        NstUtility.collection.replaceById(vm.post.places, result.fromPlace.id, result.toPlace);
      });
    }

    function toggleMoveTo(show) {
      vm.showMoveTo = show;
    }

    function showTrustedBody() {
      if (vm.orginalPost) {
        vm.body = vm.orginalPost.getTrustedBody();
      } else {
        vm.body = vm.post.getTrustedBody();
      }

      vm.trusted = true;
    }

    function loadNewComments($event) {
      if ($event) $event.preventDefault();
      eventReferences.push($scope.$broadcast('post-load-new-comments', { postId: vm.post.id }));
      reloadCounters();
      vm.unreadCommentsCount = 0;
    }

    function hasDeleteAccess(place) {
      return place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
    }

    eventReferences.push($rootScope.$on('post-viewed', function (e, data) {
      if (data.postId !== vm.post.id) return;

      reloadCounters();
      vm.unreadCommentsCount = 0;
    }));

    eventReferences.push($rootScope.$on(NST_POST_EVENT.BOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.pinned = true;
      }
    }));

    eventReferences.push($rootScope.$on(NST_POST_EVENT.UNBOOKMARKED, function (e, data) {
      if (data.postId === vm.post.id) {
        vm.post.pinned = false;
      }
    }));

    eventReferences.push($rootScope.$on('post-modal-closed', function (event, data) {
      if (data.postId === vm.post.id) {
        event.preventDefault();
        // replace last 3 comments and reset new comments counter
        vm.unreadCommentsCount = 0;
        vm.post.comments = data.comments;
        // update the post counters
        reloadCounters();
      }
    }));

    function reloadCounters() {
      NstSvcPostFactory.getCounters(vm.post.id).then(function (counters) {
        vm.post.counters = counters;
      });
    }

    $scope.$watch(function(){
      return vm.isChecked;
    },function(){
      $scope.$emit('post-select',{postId: vm.post.id,isChecked : vm.isChecked});
    });

    $scope.$on('selected-length-change',function(e, v){
      if ( v.selectedPosts.length > 0) {
        vm.isCheckedForce = true;
      } else {
        vm.isCheckedForce = false;
        vm.isChecked = false;
      }

      // for ( var i = 0; i < v.selectedPosts; i++ ) {
      //     var index = v.selectedPostsArray.indexOf(vm.placeId);
      //     if ( index > -1 ) {

      //     } else {
      //       vm.isChecked = false;
      //     }
      // }
    });

    eventReferences.push($rootScope.$on(NST_EVENT_ACTION.COMMENT_ADD, function (e, data) {

      if (vm.post.id !== data.activity.post.id) {
        return;
      }

      var senderIsCurrentUser = NstSvcAuth.user.id == data.activity.comment.sender.id;
      if (senderIsCurrentUser) {
        loadNewComments();
        if (!_.includes(newCommentIds, data.activity.id)) {
          newCommentIds.push(data.activity.id);
          vm.post.counters.comments++;
        }
      } else {
        if (!_.includes(unreadCommentIds, data.activity.id)) {
          vm.unreadCommentsCount++;
          unreadCommentIds.push(data.activity.id);
        }
      }
    }));


    eventReferences.push($rootScope.$on('post-read-all', function (e, data) {
      vm.post.read = true;
    }));


    // initializing
    (function () {
      vm.currentUserIsSender = NstSvcAuth.user.id == vm.post.sender.id;
      vm.isForwarded = !!vm.post.forwardFromId;
      vm.isReplyed = !!vm.post.replyToId;
      vm.watched = vm.post.watched;

      vm.hasOlderComments = (vm.post.counters.comments && vm.post.comments) ? vm.post.counters.comments > vm.post.comments.length : false;
      vm.body = vm.post.body;
      vm.orginalPost = vm.post;
      if (vm.post.trusted) {
        showTrustedBody();
      }
      if ($stateParams.placeId) {
        vm.currentPlace = _.filter(vm.post.places, function (place) {
          return place.id === $stateParams.placeId;
        })[0];
      }
      if (vm.addOn) {
        vm.isExpanded = true;
      }

      eventReferences.push($scope.$on('comment-removed', function (event, data) {
        if (vm.post.id === data.postId) {
          vm.post.counters.comments--;
        }
      }));
      eventReferences.push($scope.$on('post-attachment-viewed', function (event, data) {
        if (vm.post.id === data.postId && !vm.post.read) {
          markAsRead();
        }
      }));

      vm.placesWithRemoveAccess = getPlacesWithRemoveAccess();
      vm.placesWithControlAccess = getPlacesWithControlAccess();

      //FIXME:: fix this item
      setTimeout(function () {
        $(".post-body a").attr("target", "_blank");
      }, 1000);

      // sometimes the post attachments does not have id and we did not find the problem
      // so we are trying to get the post and replace it with the previous corrupted post

      if (_.some(vm.post.attachments, function (attachment) {
        return !attachment.id;
      })) {
        NstSvcLogger.error('Found that the post model has an attachment with empty id!');
        vm.post.attachments = [];
        NstSvcPostFactory.get(vm.post.id, true).then(function (post) {
          vm.post.attachments = post.attachments;
        });
      }
    })();

    $scope.$on('$destroy', function () {
      if (focusOnSentTimeout) {
        $timeout.cancel(focusOnSentTimeout);
      }

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
    function switchToPostCard() {
      // tells the parent scope to open me
      var reference = $scope.$emit('post-chain-expand-me', {postId: vm.post.id});
      eventReferences.push(reference);
      ++$scope.$parent.$parent.affixObserver;
    }

    function onAddComment() {
      if (!vm.post.read) {
        markAsRead();
      }
    }

    function isPlaceFeed() {
      if ($state.current.name === 'app.messages-favorites' ||
          $state.current.name === 'app.messages-sorted' ||
          $state.current.name === 'app.messages-favorites-sorted') {
        return vm.isPlaceFilter = true;
      }
      return vm.isPlaceFilter = false;
    }

    function getPlacesWithRemoveAccess() {
      return _.filter(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.REMOVE_POST);
      });
    }

    function getPlacesWithControlAccess() {
      return _.filter(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.CONTROL);
      });
    }

    function hasPlacesWithControlAccess() {
      return _.some(vm.post.places, function (place) {
        return place.hasAccess(NST_PLACE_ACCESS.CONTROL);
      });
    }
  }

})();
