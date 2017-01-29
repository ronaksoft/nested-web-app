(function () {
    'use strict';

    angular
      .module('ronak.nested.web.message')
      .controller('PostCardController', PostCardController)

    function PostCardController($state, $log, $timeout, $rootScope, $scope,
                                _, moment, toastr,
                                NST_POST_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT,
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
          targetChangedUnsubscriber = null,
          expandMeUnsubscriber = null;

      vm.remove = remove;
      vm.retract = retract;
      vm.expand = expand;
      vm.collapse = collapse;
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
        $event.preventDefault();
        if ($state.current.name !== 'app.message') {
            $state.go('app.message', {postId: vm.post.id}, {notify: false});
        } else {
            targetChangedUnsubscriber = $scope.$emit('post-view-target-changed', { postId : vm.post.id });
        }
      };


      function markAsRead() {
        if (!vm.post.postIsRed)
          NstSvcPostFactory.read([vm.post.id]).then(function (result) {
            vm.post.postIsRed = true;
          }).catch(function (err) {
            $log.debug('MARK AS READ :' + err);
          });
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

      function expand() {
        vm.expandProgress = true;
        NstSvcPostFactory.get(vm.post.id).then(function (post) {
          vm.body = post.body;
          vm.isExpanded = true;
        }).catch(function (error) {
          toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
        }).finally(function () {
          vm.expandProgress = false;
        });
      }

      function collapse() {
        vm.isExpanded = false;
        vm.body = vm.post.body;
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
          vm.post.commentsCount += vm.unreadCommentsCount;
          vm.unreadCommentsCount = 0;

          vm.post.commentsCount -= data.removedCommentsCount || 0;
          vm.post.comments = data.comments;
        }
      });

      NstSvcSync.addEventListener(NST_EVENT_ACTION.COMMENT_ADD, function (e) {

        if (vm.post.id !== e.detail.post.id) {
          return;
        }

        var senderIsCurrentUser = NstSvcAuth.getUser().getId() == e.detail.comment.sender.id;
        if (senderIsCurrentUser) {
          if (!_.includes(newCommentIds, e.detail.id)) {
            newCommentIds.push(e.detail.id);
            vm.post.commentsCount++;
          }
        } else {
          if (!_.includes(unreadCommentIds, e.detail.id)) {
            unreadCommentIds.push(e.detail.id);
            vm.unreadCommentsCount++;
          }
        }
      });


      // initializing
      (function () {

        vm.hasOlderComments = (vm.post.commentsCount && vm.post.comments) ? vm.post.commentsCount > vm.post.comments.length : false;
        vm.body = vm.post.body;

      })();

      $scope.$on('$destroy', function () {
        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }

        if (expandMeUnsubscriber) {
            expandMeUnsubscriber();
        }

        if (targetChangedUnsubscriber) {
            targetChangedUnsubscriber();
        }
      });

      function switchToPostCard() {
        // tells the parent scope to open me
        expandMeUnsubscriber = $scope.$emit('post-chain-expand-me', {postId: vm.post.id});
      }

      function onAddComment(comment) {
        markAsRead();
      }
    }

  })();
