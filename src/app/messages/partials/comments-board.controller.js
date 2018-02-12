(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentsBoardController', CommentsBoardController);

  function CommentsBoardController($timeout, $scope, $sce, $q, $state, $location, $anchorScroll,
                                   NstSvcAuth, NstSvcDate, NstSvcCommentFactory, NstUtility, NstSvcTranslation, NstSvcTaskFactory,
                                   moment, toastr, NstSvcLogger, _) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentsSettings = {
        limit: 8,
        date: null
      },
      // newCommentIds = [],
      // unreadCommentIds = [],
      focusOnSentTimeout = null,
      pageEventKeys = [];

    vm.removeComment = removeComment;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.sendComment = sendComment;
    vm.sendVoiceComment = sendVoiceComment;
    vm.hasOlderComments = null;
    vm.commentBoardIsRolled = null;
    vm.isSendingComment = false;
    vm.hasAnyRemoved = false;
    vm.retrySendComment = retrySendComment;
    vm.commentBoardLimit = commentBoardMin;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.canShowOlderComments = canShowOlderComments;
    vm.commentBoardNeedsRolling = commentBoardNeedsRolling;
    vm.isInFirstDay = isInFirstDay;
    vm.unreadCommentsCount = 0;
    vm.sendCommentCount = 1;
    vm.showRemoved = false;
    vm.isRecording = false;
    vm.post = {
      newComment: ''
    };

    (function () {
      vm.hasOlderComments = vm.totalCommentsCount > vm.comments.length;
      if (vm.postId) {
        pageEventKeys.push($scope.$on('post-load-new-comments', function (event, data) {
          if (data.postId === vm.postId && data.news.length > 0) {
            loadRecentComments(data.news, data.scrollIntoView);
          }
        }));
        if ($state.current.name === 'app.message') {
          vm.comments = [];
          loadMoreComments();
        }
      }

      vm.commentBoardId = vm.postId || vm.taskId;

      vm.lastComment = findLastComment(vm.comments);
      vm.hasAnyRemoved = _.some(vm.comments, 'removedById');

      vm.user = NstSvcAuth.user;
    })();

    function findLastComment(comments) {
      return _.last(_.orderBy(comments, 'timestamp'));
    }

    function getLastCommentDate() {
      var date = null;
      vm.lastComment = vm.lastComment || findLastComment(vm.comments);
      if (vm.lastComment) {
        date = vm.lastComment.timestamp;
      } else {
        date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
      }

      return date;
    }

    function getRecentComments(settings) {
      var deferred = $q.defer();
      var result = {
        comments: [],
        maybeMoreComments: null
      };
      vm.commentLoadProgress = true;
      NstSvcCommentFactory.getCommentsAfter(vm.postId, settings).then(function (comments) {
        result.comments = comments;
        result.maybeMoreComments = (comments.length === settings.limit);
        deferred.resolve(result);
      }).catch(deferred.reject).finally(function () {
        vm.commentLoadProgress = false;
      });
      return deferred.promise;
    }

    function loadRecentComments(news, scrollIntoView) {
      var settings = {
        date: getLastCommentDate(vm.comments),
        limit: 30
      };

      getRecentComments(settings).then(function (result) {
        result.comments.forEach(function (cm) {
          cm.isNew = true
        })
        var newComments = reorderComments(result.comments);
        vm.comments = vm.comments.concat(newComments);
        vm.lastComment = findLastComment(vm.comments);
        vm.hasAnyRemoved = _.some(vm.comments, 'removedById');
        vm.commentBoardLimit = 30;
        if (newComments.length > 0 && newComments[0].id && scrollIntoView) {
          // $location.hash('comment-' + newComments[0].id);
          // $anchorScroll();

          setTimeout(function () {
            // $('.uib-wrapper-post-view').animate({
            //   scrollTop: $('#' + 'comment-' + newComments[0].id).offset().top
            // }, 800, function(){
            // });
            document.querySelector('#' + 'comment-' + newComments[0].id).scrollIntoView({behavior: 'smooth'});
          }, 256)

        }
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });
    }

    function reorderComments(comments) {
      return _.chain(comments).filter(function (comment) {
        return !_.some(vm.comments, {id: comment.id});
      }).orderBy('timestamp', 'asc').value();
    }

    function removeComment(comment) {
      if (vm.commentRemoveProgress) {
        return;
      }
      vm.commentRemoveProgress = true;
      NstSvcCommentFactory.removeComment(vm.postId, comment).then(function () {
        NstUtility.collection.dropById(vm.comments, comment.id);
        var canceler = $scope.$emit('comment-removed', {postId: vm.postId, commentId: comment.id});
        pageEventKeys.push(canceler);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occured while removing your comment'));
      }).finally(function () {
        vm.commentRemoveProgress = false;
      });
    }

    function allowToRemoveComment(comment) {
      return vm.hasCommentRemoveAccess ||
        (comment.sender && comment.sender.id === vm.user.id && vm.isInFirstDay(comment));
    }

    function isInFirstDay(comment) {
      return (NstSvcDate.now() - comment.timestamp) < 24 * 60 * 60 * 1e3;
    }

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    var resizeTextare = _.debounce(resize, 100);

    function resize(el) {
      el.style.height = '';
      el.style.height = el.scrollHeight + "px";
    }

    function retrySendComment(commentModel) {
      if (vm.postId) {
        NstSvcCommentFactory.addComment(vm.postId, commentModel.body).then(function (comment) {
          addCommentCallback(comment, commentModel);
        }).catch(function () {
          addCommentFailedCallback(commentModel);
        });
      } else {
        NstSvcTaskFactory.addComment(vm.taskId, body).then(function (comment) {
          addCommentCallback(comment, commentModel);
        }).catch(function () {
          addCommentFailedCallback(commentModel);
        });
      }
    }

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    function sendComment(e) {

      var element = angular.element(e.target);

      resizeTextare(e.target);

      if (!sendKeyIsPressed(e) || element.attr("mention") === "true") {
        return;
      }
      var body = extractCommentBody(e);

      if (body.length === 0) {
        return;
      }

      // vm.isSendingComment = true;

      var commentModel = {
        attachmentId: '',
        body: body,
        _id: vm.sendCommentCount,
        removed: false,
        removedBy: '',
        removedById: '',
        sender: vm.user,
        senderId: '',
        timestamp: Date.now()
      };
      
      commentModel.isSending = true;
      vm.sendCommentCount++;
      vm.commentBoardLimit++;

      if (!_.some(vm.comments, {
        id: commentModel.id
      })) {
        commentModel.indexInComments = vm.comments.length
        vm.comments.push(commentModel);
      }

      $timeout(function(){
        vm.post.newComment = '';
        e.currentTarget.value = '';
        resizeTextare(e.target);
        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }
        focusOnSentTimeout = $timeout(function () {
            e.currentTarget.focus();
        }, 2);
      }, 10);

      if (vm.postId) {
        NstSvcCommentFactory.addComment(vm.postId, body).then(function (comment) {
          addCommentCallback(comment, commentModel);
        }).catch(function () {
          addCommentFailedCallback(commentModel);
        });
      } else {
        NstSvcTaskFactory.addComment(vm.taskId, body).then(function (comment) {
          addCommentCallback(comment, commentModel);
        }).catch(function () {         
          addCommentFailedCallback(commentModel);
        });
      }
    }

    function addCommentFailedCallback(commentModel) {
      vm.comments[commentModel.indexInComments].isSending = false;
      vm.comments[commentModel.indexInComments].isFailed = true;
      toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
    }
  
    function addCommentCallback(comment, commentModel) {
      if (!_.some(vm.comments, {
          id: comment.id
        })) {
          vm.comments[commentModel.indexInComments] = comment;
      }
      // vm.isSendingComment = false;
      
      if (typeof vm.onCommentSent === 'function') {
        vm.onCommentSent(comment);
      }
    }

    //TODO: merge with sendComment
    function sendVoiceComment(attachmentId) {
      vm.isSendingComment = true;

      if (vm.postId) {
        NstSvcCommentFactory.addComment(vm.postId, '', attachmentId).then(function (/*comment*/) {
          // addCommentCallback(comment)
          vm.isSendingComment = false;
          vm.post.newComment = '';
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
          vm.isSendingComment = false;
          vm.post.newComment = '';
        });
      } else {
        NstSvcTaskFactory.addComment(vm.taskId, '', attachmentId).then(function (/*comment*/) {
          // addCommentCallback(comment)
          vm.isSendingComment = false;
          vm.post.newComment = '';
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
          vm.isSendingComment = false;
          vm.post.newComment = '';
        });
      }

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
      vm.hasOlderComments = vm.totalCommentsCount > vm.comments.length;
      vm.hasAnyRemoved = _.some(_.takeRight(vm.comments, commentBoardMin), 'removedById');
    }

    function clearCommentBoardLimit() {
      vm.commentBoardLimit = commentBoardMax;
      vm.commentBoardIsRolled = false;
      vm.hasAnyRemoved = _.some(_.takeRight(vm.comments, commentBoardMax), 'removedById');
    }

    function findOlder() {
      return _.first(_.orderBy(vm.comments, 'timestamp'));
    }

    function getOlderDate() {
      var oldest = findOlder();
      var date = oldest ? oldest.timestamp : NstSvcDate.now();

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
      return vm.comments.length > 3;
      // return vm.commentBoardIsRolled === false && vm.comments.length > 3;
    }

    function loadMoreComments() {
      var date = getOlderDate(vm.comments);

      NstSvcCommentFactory.retrieveComments(vm.postId, {
        date: date,
        limit: commentsSettings.limit
      }).then(function (comments) {

        vm.hasOlderComments = comments.length >= commentsSettings.limit;
        var orderedItems = reorderComments(comments);
        vm.comments.unshift.apply(vm.comments, orderedItems);
        vm.hasAnyRemoved = _.some(vm.comments, 'removedById');
        vm.lastComment = findLastComment(vm.comments);

        clearCommentBoardLimit();
      }).catch(function () {
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
