(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PostCardController', PostCardController)

  function PostCardController($state, $log, $timeout, $rootScope,
                              _, moment,
                              NST_POST_EVENT, NST_COMMENT_EVENT,
                              NstSvcCommentFactory, NstSvcPostFactory, NstSvcCommentMap, NstSvcAuth) {
    var vm = this;
    var commentBoardMin = 3;
    var commentBoardMax = 99;
    var commentsSettings = {
      limit : 8,
      date : null
    };

    vm.newCommentsCount = 0;
    vm.myAlreadyCountedIds = [];
    vm.sendComment = sendComment;

    vm.hasOlderComments = true;
    vm.commentBoardIsRolled = null;
    vm.isSendingComment = false;
    vm.commentBoardLimit = commentBoardMin;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.canShowOlderComments = canShowOlderComments;
    vm.commentBoardNeedsRolling = commentBoardNeedsRolling;


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
        if (!_.some(vm.post.comments, { id : comment.id })) {
          vm.commentBoardLimit++;
          vm.post.comments.push(NstSvcCommentMap.toMessageComment(comment));
        }

        e.currentTarget.value = '';
        vm.isSendingComment = false;
        $timeout(function () {
          e.currentTarget.focus();
        },10)
      }).catch(function (error) {
        $log.debug(error);
      });

      return false;
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

      return moment(date).subtract(1, 'ms').valueOf();
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
          date : date,
          limit : commentsSettings.limit
      }).then(function (comments) {
        vm.hasOlderComments = comments.length >= commentsSettings.limit;
        var commentItems = _.orderBy(_.map(comments, NstSvcCommentMap.toMessageComment), 'date', 'asc');
        vm.post.comments = _.concat(commentItems, vm.post.comments);
        clearCommentBoardLimit();
      }).catch(function (error) {
        $log.debug(error);
      });
    }


    /**
     * anonymous function - Reset newCommentsCount when the post has been seen
     *
     * @param  {CustomEvent} e The event
     */
    NstSvcPostFactory.addEventListener(NST_POST_EVENT.VIEWED, function (e) {
      if (e.detail.postId === vm.post.id) {
        vm.post.commentsCount += vm.newCommentsCount;
        vm.newCommentsCount = 0;
      }
    });

    $rootScope.$on('post-modal-closed', function (event, data) {
      if (data.postId === vm.post.id) {
        event.preventDefault();
        if (data.comments && data.comments.length > 0) {
          vm.post.comments = _.clone(data.comments);
        }
        vm.post.commentsCount = data.totalCommentsCount;
        vm.newCommentsCount = 0;
      }
    });

    NstSvcCommentFactory.addEventListener(NST_COMMENT_EVENT.ADD, function(e) {
      if (vm.post.id === e.detail.postId){
        // If me sending comment from another device, then add number to badge
        var meSent = NstSvcAuth.getUser().getId() == e.detail.comment.sender.id;
        var fromPostCard = vm.isSendingComment;
        var isAppEvent = e.detail.internal;
        if (meSent) {
          if (vm.myAlreadyCountedIds.indexOf(e.detail.id) > -1) {
            vm.myAlreadyCountedIds = _.filter(vm.myAlreadyCountedIds, function (v) { return e.detail.id != v; });
          } else {
            if (fromPostCard) {
              vm.post.commentsCount++;
            } else {
              // From Post View or Other Devices: Add to badge
              vm.newCommentsCount++;
            }

            vm.myAlreadyCountedIds.push(e.detail.id);
          }
        } else {
          // Add to badge
          vm.newCommentsCount++;
        }
      }
    });

    // initializing
    (function () {

      vm.hasOlderComments = vm.post.commentsCount && vm.post.comments  ? vm.post.commentsCount > vm.post.comments.length : false;

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
          placeId : vm.thisPlace,
          postId : vm.post.id
        });
      } else {
        vm.urls['chain'] = $state.href('app.message-chain', {
          postId : vm.post.id
        });
      }

    })();

  }

})();
