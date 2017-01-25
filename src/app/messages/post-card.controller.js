(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostCardController', PostCardController)

  function PostCardController($state, $log, $timeout, $rootScope, $scope,
                              _, moment, toastr,
                              NST_POST_EVENT, NST_EVENT_ACTION,
                              NstSvcSync, NstSvcCommentFactory, NstSvcPostFactory, NstSvcCommentMap, NstSvcAuth, NstUtility, NstSvcPostInteraction, NstSvcTranslation) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentsSettings = {
        limit: 8,
        date: null
      },
      newCommentIds = [],
      unreadCommentIds = [],
      focusOnSentTimeout = null;

    vm.remove = remove;
    vm.retract = retract;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.body = null;
    vm.markAsRead = markAsRead;
    vm.chainView = false;
    vm.switchToPostCard = switchToPostCard;
    vm.onAddComment = onAddComment;

    if (vm.mood == 'chain') {
      vm.chainView = true;
    }



    function markAsRead() {
      if(!vm.post.postIsRed)
        NstSvcPostFactory.read([vm.post.id]).then(function (result) {
          vm.post.postIsRed = true;
        }).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
    }

    function remove() {
      NstSvcPostInteraction.remove(vm.post, _.filter(vm.post.allPlaces, {id: vm.thisPlace})).then(function (place) {
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
      NstSvcPostFactory.get(vm.post.id).then(function (post) {
        vm.body = post.body;
        vm.isExpanded = true;
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the post full body.'));
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

    vm.fullView = function (e) {
      e.preventDefault;
      $state.go('app.message', { postId : vm.post.id, model : vm.post }, { notify : false});
    };

    // initializing
    (function () {

      vm.hasOlderComments = vm.post.commentsCount && vm.post.comments ? vm.post.commentsCount > vm.post.comments.length : false;
      vm.body = vm.post.body;
      // Later on, ask server whether to expand or not
      //vm.isExpandable = vm.body.length > 250;

      vm.urls = {};
      vm.urls['reply_all'] = $state.href('app.compose-reply-all', {
        postId: vm.post.id
      });

      vm.urls['reply_sender'] = $state.href('app.compose-reply-sender', {
        postId: vm.post.id
      });

      vm.urls['forward'] = $state.href('app.compose-forward', {
        postId: vm.post.id
      });

      vm.urls['full'] = $state.href('app.message', { postId : vm.post.id, model : vm.post }, { notify : false});

      if (vm.thisPlace) {
        vm.urls['chain'] = $state.href('app.place-message-chain', {
          placeId: vm.thisPlace,
          postId: vm.post.id
        });
      } else {
        vm.urls['chain'] = $state.href('app.message-chain', {
          postId: vm.post.id
        });
      }

    })();

    $scope.$on('$destroy', function () {
      if (focusOnSentTimeout) {
        $timeout.cancel(focusOnSentTimeout);
      }
    });

    function switchToPostCard() {
      // tells the parent scope to open me
      $scope.$emit('post-chain-expand-me', { postId : vm.post.id });
    }

    function onAddComment(comment) {
      markAsRead();
    }
  }

})();
