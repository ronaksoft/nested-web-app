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

    vm.sendComment = sendComment;

    vm.hasOlderComments = true;
    vm.commentBoardIsRolled = null;
    vm.isSendingComment = false;
    vm.commentBoardLimit = commentBoardMin;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.canShowOlderComments = canShowOlderComments;
    vm.commentBoardNeedsRolling = commentBoardNeedsRolling;
    vm.unreadCommentsCount = 0;
    vm.remove = remove;
    vm.retract = retract;
    vm.markAsRead = markAsRead;


    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    function sendComment(e) {

      var element = angular.element(e.target);
      if (!sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }

      var body = extractCommentBody(e);
      if (body.length === 0) {
        return;
      }

      vm.isSendingComment = true;

      NstSvcCommentFactory.addComment(vm.post.id, body).then(function (comment) {
        if (!_.some(vm.post.comments, {id: comment.id})) {
          vm.commentBoardLimit++;
          vm.post.comments.push(NstSvcCommentMap.toMessageComment(comment));
        }

        e.currentTarget.value = '';
        vm.isSendingComment = false;
        if (focusOnSentTimeout) {
          $timout.cancel(focusOnSentTimeout);
        }

        focusOnSentTimeout = $timeout(function () {
          e.currentTarget.focus();
        }, 10)
      }).catch(function (error) {
        $log.debug(error);
      });

      markAsRead();
      return false;
    }


    function markAsRead() {
      if(!vm.post.postIsRed)
        NstSvcPostFactory.read([vm.post.id]).then(function (result) {
          vm.post.postIsRed = true;
        }).catch(function (err) {
          $log.debug('MARK AS READ :' + err);
        });
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    /**
     * extractCommentBody - extract and refine the comment
     *
     * @param  {Event}    e   event handler
     * @return {string}       refined comment
     */
    function extractCommentBody(e) {
      return e.currentTarget.value.trim();
    }

    function limitCommentBoard() {
      vm.commentBoardLimit = commentBoardMin;
      vm.commentBoardIsRolled = true;
      vm.hasOlderComments = true;
    }

    function clearCommentBoardLimit() {
      vm.commentBoardLimit = commentBoardMax;
      vm.commentBoardIsRolled = false;
    }

    function findOldestComment(post) {
      return _.first(_.orderBy(post.comments, 'date'));
    }

    function getDateOfOldestComment(post) {
      var oldest = findOldestComment(post);
      var date = null;
      if (oldest) {
        date = oldest.date;
      } else {
        date = post.date;
      }

      return NstUtility.date.toUnix(moment(date).subtract(1, 'ms'));
    }

    function showOlderComments() {
      if (vm.commentBoardIsRolled) {
        clearCommentBoardLimit();
      } else {
        loadMoreComments();
      }
    }

    function canShowOlderComments() {
      return vm.hasOlderComments || vm.commentBoardIsRolled === true;
    }

    function commentBoardNeedsRolling() {
      return vm.commentBoardIsRolled === false;
    }

    function loadMoreComments() {
      var date = getDateOfOldestComment(vm.post);

      NstSvcCommentFactory.retrieveComments(vm.post.id, {
        date: date,
        limit: commentsSettings.limit
      }).then(function (comments) {
        vm.hasOlderComments = comments.length >= commentsSettings.limit;
        var commentItems = _.orderBy(_.map(comments, NstSvcCommentMap.toMessageComment), 'date', 'asc');
        vm.post.comments = _.concat(commentItems, vm.post.comments);
        clearCommentBoardLimit();
      }).catch(function (error) {
        $log.debug(error);
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

    // initializing
    (function () {

      vm.hasOlderComments = vm.post.commentsCount && vm.post.comments ? vm.post.commentsCount > vm.post.comments.length : false;

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
  }

})();
