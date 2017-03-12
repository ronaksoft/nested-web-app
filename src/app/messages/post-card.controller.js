(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostCardController', PostCardController)

  function PostCardController($state, $log, $timeout, $rootScope, $scope, $filter, $window, $sce,
                              _, moment, toastr,
                              NST_POST_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT, NST_PLACE_ACCESS, SvcCardCtrlAffix,
                              NstSvcSync, NstSvcCommentFactory, NstSvcPostFactory, NstSvcAuth, NstUtility, NstSvcPostInteraction, NstSvcTranslation) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentsSettings = {
        limit: 8,
        date: null
      },
      newCommentIds = [],
      unreadCommentIds = [],
      focusOnSentTimeout = null,
      pageEventReferences = [];

    vm.remove = remove;
    vm.hasDeleteAccess = hasDeleteAccess;
    vm.retract = retract;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.showTrustedBody = showTrustedBody;
    vm.body = null;
    vm.markAsRead = markAsRead;
    vm.chainView = false;
    vm.switchToPostCard = switchToPostCard;
    vm.onAddComment = onAddComment;
    vm.expandProgress = false;
    vm.replyAll = replyAll;
    vm.forward = forward;
    vm.replyToSender = replyToSender;
    vm.viewFull = viewFull;
    vm.setBookmark = setBookmark;
    vm.unreadCommentsCount = 0;
    vm.loadNewComments = loadNewComments;

    if (vm.mood == 'chain') {
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
        $state.go('app.message', {postId: vm.post.id, trusted: true}, {notify: false});
      } else {
        var reference = $scope.$emit('post-view-target-changed', {postId: vm.post.id});
        pageEventReferences.push(reference);
      }
    }


    function markAsRead() {
      if (!vm.post.isRead) {
        vm.post.isRead = true;
        NstSvcPostFactory.read([vm.post.id]).then(function () {
        }).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
      }
    }

    function setBookmark(setBookmark) {
      vm.post.bookmarked = setBookmark;
      if (setBookmark) {
        NstSvcPostFactory.bookmarkPost(vm.post.id).catch(function () {
          vm.post.bookmarked = !setBookmark;
        });
      } else {
        NstSvcPostFactory.unBookmarkPost(vm.post.id).catch(function () {
          vm.post.bookmarked = !setBookmark;
        });
      }
    }

    function remove(placeId) {
      var targetPlaceId = placeId || vm.thisPlace;
      NstSvcPostInteraction.remove(vm.post, _.filter(vm.post.allPlaces, {id: targetPlaceId})).then(function (place) {
        if (place) {
          vm.post.dropPlace(place.id);
          toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been removed from Place {0}."), place.name));
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occurred in trying to remove this message from the selected Place."));
      });
    }

    function retract() {
      vm.retractProgress = true;
      NstSvcPostInteraction.retract(vm.post).finally(function () {
        vm.retractProgress = false;
      });
    }

    function hasDeleteAccess(place) {
      return _.includes(vm.post.placesWithRemoveAccess, place.id);
    }


    function expand() {
      vm.expandProgress = true;
      NstSvcPostFactory.get(vm.post.id).then(function (post) {
        vm.orginalPost = post;
        vm.body = $sce.trustAsHtml(post.body);
        vm.resources = post.resources;
        vm.isExpanded = true;
        if (!post.isRead) {
          markAsRead();
        }

        if (vm.post.trusted || Object.keys(post.resources).length == 0){
          showTrustedBody();
        }

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
        var postCollaspeTimeout = scrollOnCollapseCase ? 300 : 0 ;
        if(scrollOnCollapseCase) {
          $('html, body').animate({
            scrollTop: postCardOffTOp
          }, 300, 'swing', function () {
            SvcCardCtrlAffix.change();
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

    function showTrustedBody() {
      if (vm.orginalPost) {
        vm.body = $sce.trustAsHtml(vm.orginalPost.getTrustedBody());
      }else{
        vm.body = $sce.trustAsHtml(vm.post.getTrustedBody());
      }
      vm.post.trusted = true;
    }

    function loadNewComments($event) {
      $event.preventDefault();
      var reference = $scope.$broadcast('post-load-new-comments', {postId: vm.post.id});
      pageEventReferences.push(reference);

      vm.post.commentsCount += vm.unreadCommentsCount;
      vm.unreadCommentsCount = 0;
    }

    /**
     * anonymous function - Reset newCommentsCount when the post has been seen
     *
     * @param  {CustomEvent} e The event
     */
    NstSvcPostFactory.addEventListener(NST_POST_EVENT.VIEWED, function (e) {
      if (e.detail.postId === vm.post.id) {
        vm.post.commentsCount += vm.unreadCommentsCount;
        vm.unreadCommentsCount = 0;
      }
    });

    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.BOOKMARKED, function (e) {
      if (e.detail === vm.post.id) {
        vm.post.bookmarked = true;
      }
    });

    NstSvcPostFactory.addEventListener(NST_POST_FACTORY_EVENT.UNBOOKMARKED, function (e) {
      if (e.detail === vm.post.id) {
        vm.post.bookmarked = false;
      }
    });

    $rootScope.$on('post-modal-closed', function (event, data) {
      if (data.postId === vm.post.id) {
        event.preventDefault();
        vm.post.commentsCount = data.totalCommentsCount;

        vm.post.commentsCount += vm.unreadCommentsCount;
        vm.unreadCommentsCount = 0;

        //   vm.post.commentsCount -= data.removedCommentsCount || 0;
        vm.post.comments = data.comments;
      }
    });

    NstSvcSync.addEventListener(NST_EVENT_ACTION.COMMENT_ADD, function (e) {

      if (vm.post.id !== e.detail.post.id) {
        return;
      }

      var senderIsCurrentUser = NstSvcAuth.user.id == e.detail.comment.sender.id;
      if (senderIsCurrentUser) {
        if (!_.includes(newCommentIds, e.detail.id)) {
          newCommentIds.push(e.detail.id);
          vm.post.commentsCount++;
        }
      } else {
        if (!_.includes(unreadCommentIds, e.detail.id)) {
          vm.unreadCommentsCount++;
          unreadCommentIds.push(e.detail.id);
        }
      }
    });


    // initializing
    (function () {

      vm.hasOlderComments = (vm.post.commentsCount && vm.post.comments) ? vm.post.commentsCount > vm.post.comments.length : false;
      vm.body = $sce.trustAsHtml(vm.post.body);
      if (vm.post.trusted){
        showTrustedBody();
      }

      if (vm.addOn) {
        vm.isExpanded = true;
      }

      pageEventReferences.push($scope.$on('comment-removed', function (event, data) {
        if (vm.post.id === data.postId) {
          vm.post.commentsCount--;
        }
      }));
      pageEventReferences.push($scope.$on('post-attachment-viewed', function (event, data) {
        if (vm.post.id === data.postId && !vm.post.isRead) {
          markAsRead();
        }
      }));


      //FIXME:: fix this item
      setTimeout(function () {
        $(".post-body a").attr("target", "_blank");
      }, 1000);


    })();

    $scope.$on('$destroy', function () {
      if (focusOnSentTimeout) {
        $timeout.cancel(focusOnSentTimeout);
      }

      _.forEach(pageEventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

    function switchToPostCard() {
      // tells the parent scope to open me
      var reference = $scope.$emit('post-chain-expand-me', {postId: vm.post.id});
      pageEventReferences.push(reference);
    }

    function onAddComment() {
      if (!vm.post.isRead) {
        markAsRead();
      }
    }
  }

})();
