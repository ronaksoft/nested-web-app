(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentsBoardController', CommentsBoardController);

  function CommentsBoardController($timeout,
    NstSvcAuth, NstSvcCommentFactory, NstSvcCommentMap, NstUtility, NstSvcTranslation,
    moment, toastr, _) {
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

    vm.removeComment = removeComment;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.sendComment = sendComment;
    vm.hasOlderComments = null;
    vm.commentBoardIsRolled = null;
    vm.isSendingComment = false;
    vm.commentBoardLimit = commentBoardMin;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.canShowOlderComments = canShowOlderComments;
    vm.commentBoardNeedsRolling = commentBoardNeedsRolling;
    vm.unreadCommentsCount = 0;
    (function () {
      vm.hasOlderComments = vm.totalCommentsCount > vm.comments.length;
    })();
    function removeComment(comment) {
      if (vm.commentRemoveProgress) {
        return;
      }
      vm.commentRemoveProgress = true;
      NstSvcCommentFactory.removeComment(vm.postId, comment).then(function(post) {
        NstUtility.collection.dropById(vm.comments, comment.id);
      }).catch(function(error) {
        console.log(error);
        toastr.error(NstSvcTranslation.get('Sorry, an error has occured while removing your comment'));
      }).finally(function() {
        vm.commentRemoveProgress = false;
      });
    }

    function allowToRemoveComment(comment) {
      return comment.sender.username === NstSvcAuth.user.id &&
        (Date.now() - comment.date) < 24 * 60 * 60 * 1e3;

    }

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

      NstSvcCommentFactory.addComment(vm.postId, body).then(function(comment) {
        if (!_.some(vm.comments, {
            id: comment.id
          })) {
          vm.commentBoardLimit++;
          var commentItem = NstSvcCommentMap.toMessageComment(comment);
          var lastComment = _.last(vm.comments);


          if (lastComment && lastComment.sender.username === commentItem.sender.username) {
            commentItem.stickedToPrevious = true;
          }
          vm.comments.push(commentItem);
        }

        e.currentTarget.value = '';
        vm.isSendingComment = false;
        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }

        focusOnSentTimeout = $timeout(function() {
          e.currentTarget.focus();
        }, 10)
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occured in sending your comment'));
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
      vm.hasOlderComments = vm.totalCommentsCount > vm.comments.length;;
    }

    function clearCommentBoardLimit() {
      vm.commentBoardLimit = commentBoardMax;
      vm.commentBoardIsRolled = false;
    }

    function findOlder() {
      return _.first(_.orderBy(vm.comments, 'date'));
    }

    function getOlderDate() {
      var oldest = findOlder();
      var date = oldest ? oldest.date : Date.now();

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
      var date = getOlderDate(vm.comments);

      NstSvcCommentFactory.retrieveComments(vm.postId, {
        date: date,
        limit: commentsSettings.limit
      }).then(function(comments) {
        vm.hasOlderComments = comments.length >= commentsSettings.limit;
        var orderedItems = _.orderBy(comments, 'date', 'asc');

        _.forEach(orderedItems, function (comment, index) {
          var model = NstSvcCommentMap.toMessageComment(comment);
          var previousIndex = index - 1;
          if (previousIndex >= 0) {

            var previousComment = orderedItems[previousIndex];
            if (previousComment.sender.id === model.sender.username) {
              model.stickedToPrevious = true;
            }
          }

          vm.comments.splice(index, 0, model);
        });

        clearCommentBoardLimit();
      }).catch(function(error) {
        console.log(error);
        toastr.error('Sorry, an error has occured while loading older comments');
      });
    }
  }

})();
