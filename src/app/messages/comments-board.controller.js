(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentsBoardController', CommentsBoardController);

  function CommentsBoardController($timeout, $scope, $q, $state,
                                   NstSvcAuth, NstSvcCommentFactory, NstUtility, NstSvcTranslation,
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
      focusOnSentTimeout = null,
      pageEventKeys = [];

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
      var key = $scope.$on('post-load-new-comments', function (event, data) {
        if (data.postId === vm.postId) {
          loadRecentComments();
        }
      });

      if($state.current.name === 'app.message'){
        vm.comments = [];
        loadMoreComments();
      }

      vm.lastComment = findLastComment(vm.comments);

      pageEventKeys.push(key);
      vm.user = NstSvcAuth.user;
    })();

    function findLastComment(comments) {
      return _.last(_.orderBy(comments, 'timestamp'));
    }

    function getLastCommentDate(comments) {
      var date = null;
      vm.lastComment = vm.lastComment || findLastComment(vm.comments);
      if (vm.lastComment) {
        date = vm.lastComment.timestamp;
      } else {
        date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
      }

      return date;
    }

    function getRecentComments(postId, settings) {
      var deferred = $q.defer();
      var result = {
        comments : [],
        maybeMoreComments : null
      };
      vm.commentLoadProgress = true;
      NstSvcCommentFactory.getCommentsAfter(postId, settings).then(function (comments) {
        result.comments = comments;
        result.maybeMoreComments = (comments.length === settings.limit);
        deferred.resolve(result);
      }).catch(deferred.reject).finally(function () {
        vm.commentLoadProgress = false;
      });
      return deferred.promise;
    }

    function loadRecentComments() {
      var settings = {
        date : getLastCommentDate(vm.comments),
        limit : 30,
      };

      getRecentComments(vm.postId, settings).then(function (result) {
        var newComments = reorderComments(result.comments);
        vm.comments = vm.comments.concat(newComments);
        vm.lastComment = findLastComment(vm.comments);
        vm.commentBoardLimit = 30;
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });
    }

    function reorderComments(comments) {
      return _.chain(comments).filter(function (comment) {
        return !comment.removedById && !_.some(vm.comments, { id : comment.id });
      }).orderBy('timestamp', 'asc').value();
    }


    function removeComment(comment) {
      if (vm.commentRemoveProgress) {
        return;
      }
      vm.commentRemoveProgress = true;
      NstSvcCommentFactory.removeComment(vm.postId, comment).then(function(post) {
        NstUtility.collection.dropById(vm.comments, comment.id);
        var canceler = $scope.$emit('comment-removed', { postId : vm.postId, commentId : comment.id });
        pageEventKeys.push(canceler);
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occured while removing your comment'));
      }).finally(function() {
        vm.commentRemoveProgress = false;
      });
    }

    function allowToRemoveComment(comment) {
      return vm.hasCommentRemoveAccess || (comment.sender.id === vm.user.id &&
        (Date.now() - comment.timestamp) < 24 * 60 * 60 * 1e3);

    }

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    function sendComment(e) {


      var element = e.target;

      var resize = function() {
        e.target.style.height = '';
        e.target.style.height = e.target.scrollHeight + "px";
      };

      $timeout(resize, 0);

      var body = extractCommentBody(e);
      if (body.length === 0) {
        e.target.style.height = '';
      }

      if (!sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }

      if (body.length === 0) {
        return;
      }


      vm.isSendingComment = true;

      NstSvcCommentFactory.addComment(vm.postId, body).then(function(comment) {
        if (!_.some(vm.comments, {
            id: comment.id
          })) {
          vm.commentBoardLimit++;
          vm.comments.push(comment);
        }

        e.currentTarget.value = '';
        vm.isSendingComment = false;
        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }

        focusOnSentTimeout = $timeout(function() {
          e.currentTarget.focus();
        }, 10);
        vm.onCommentSent(comment);
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
      return _.first(_.orderBy(vm.comments, 'timestamp'));
    }

    function getOlderDate() {
      var oldest = findOlder();
      var date = oldest ? oldest.timestamp : Date.now();

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
      return vm.commentBoardIsRolled === false && vm.comments.length > 3;
    }

    function loadMoreComments() {
      var date = getOlderDate(vm.comments);

      NstSvcCommentFactory.retrieveComments(vm.postId, {
        date: date,
        limit: commentsSettings.limit
      }).then(function(comments) {

        vm.hasOlderComments = comments.length >= commentsSettings.limit;
        var orderedItems = reorderComments(comments);
        vm.comments.unshift.apply(vm.comments, orderedItems);
        vm.lastComment = findLastComment(vm.comments);

        clearCommentBoardLimit();
      }).catch(function(error) {
        toastr.error('Sorry, an error has occured while loading older comments');
      });
    }

    $scope.$on('$destroy', function () {
      _.forEach(pageEventKeys, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
