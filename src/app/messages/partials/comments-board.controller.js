(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentsBoardController', CommentsBoardController);

  function CommentsBoardController($timeout, $scope, $sce, $q, $state, $location, $anchorScroll, $rootScope, NST_POST_EVENT_ACTION,
                                   NstSvcAuth, NstSvcDate, NstSvcCommentFactory, NstUtility, NstSvcTranslation, NstSvcTaskFactory, NstSvcServer, NST_SRV_PUSH_CMD,
                                   moment, toastr, NstSvcLogger, _, NstSvcModal, NstSvcPostActivityFactory, NstSvcKeyFactory, NST_KEY, NST_TASK_EVENT_ACTION) {
    var vm = this;

    var commentBoardMin = 3,
      commentBoardMax = 99,
      commentsSettings = {
        limit: 8,
        date: null
      },
      focusOnSentTimeout = null,
      eventReferences = [];

    vm.removeComment = removeComment;
    vm.allowToRemoveComment = allowToRemoveComment;
    vm.sendComment = sendComment;
    vm.sendVoiceComment = sendVoiceComment;
    vm.hasOlderComments = null;
    vm.commentBoardIsRolled = null;
    vm.isSendingComment = false;
    vm.retrySendComment = retrySendComment;
    vm.commentBoardLimit = commentBoardMin;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.showActivities = showActivities;
    vm.canShowOlderComments = canShowOlderComments;
    vm.commentBoardNeedsRolling = commentBoardNeedsRolling;
    vm.isInFirstDay = isInFirstDay;
    vm.unreadCommentsCount = 0;
    vm.sendCommentCount = 1;
    vm.commentTypes = NST_POST_EVENT_ACTION;
    vm.activitiesActive = false;
    vm.showRemoved = false;
    vm.isRecording = false;
    vm.activities = [];
    vm.post = {
      newComment: ''
    };

    (function () {
      vm.hasOlderComments = vm.totalCommentsCount > ctrlComments().length;
      if (vm.postId) {
        eventReferences.push($scope.$on('post-load-new-comments', function (event, data) {
          if (data.postId === vm.postId && data.news.length > 0) {
            loadRecentComments(data.news, data.scrollIntoView);
          }
        }));
        if ($state.current.name === 'app.message') {
          loadMoreComments();
        }
      }
      if (vm.chainView) {
        NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_COMMENT_ACTIVITY).then(function (v) {
          if (v.length > 0) {
            vm.activitiesActive = v == 'true';
          }
          eventReferences.push(
            $scope.$watch(function () {
              return vm.activitiesActive;
            }, function (nv, ov) {
              if (nv !== ov) {
                NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_COMMENT_ACTIVITY, nv + '');
              }
            }));
        });
        
        NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_POST_ACTIVITY, function (event) {
          if (event.detail.post_id === vm.postId) {
            loadRecentComments();
          }
        });
      }

      /**
       * Event handler for removing comment
       */
      if (vm.postId) {
        eventReferences.push($rootScope.$on(NST_POST_EVENT_ACTION.INTERNAL_COMMENT_REMOVE, function (e, data) {
          if (vm.postId !== data.activity.postId) {
            return;
          }
          NstUtility.collection.dropById(vm.activities, data.activity.comment.id);
        }));
      }

      vm.commentBoardId = vm.postId || vm.taskId;

      vm.lastComment = findLastComment();

      vm.user = NstSvcAuth.user;
    })();

    function findLastComment() {
      var comments = ctrlComments();
      return _.last(_.orderBy(_.filter(comments, function (cm) {
        return cm.id.length > 4;
      }), 'timestamp'));
    }

    function getLastCommentDate() {
      var date = null;
      vm.lastComment = vm.lastComment || findLastComment();
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

      var fn = vm.chainView
      ? NstSvcPostActivityFactory.getActivities({
        postId: vm.postId,
        before: settings.date,
        limit: settings.limit
      })
      : NstSvcCommentFactory.getCommentsAfter(vm.postId, settings)

      fn
      .then(function (comments) {
        result.comments = comments;
        result.maybeMoreComments = (comments.length === settings.limit);
        deferred.resolve(result);
      }).catch(deferred.reject).finally(function () {
        vm.commentLoadProgress = false;
      });
      return deferred.promise;
    }

    function ctrlComments() {
      return vm.chainView ? vm.activities : vm.comments
    }

    function loadRecentComments(news, scrollIntoView) {
      var settings = {
        date: getLastCommentDate(ctrlComments()),
        limit: 30
      };
      getRecentComments(settings).then(function (result) {
        result.comments.forEach(function (cm) {
          cm.isNew = true
        });
        var newComments = reorderComments(result.comments);
        var sentComments = _.filter(ctrlComments(), function (cm) {
          return (cm.id + '').length < 10;
        });
        var newCommentsFromOthers
        if (vm.chainView) {
          newCommentsFromOthers = _.filter(newComments, function (cm) {
            return !_.some(sentComments, function (sentCm) {
              return sentCm.comment.body === cm.comment.body && sentCm.comment.sender.id === cm.comment.sender.id;
            })
          });
        } else {
          newCommentsFromOthers = _.filter(newComments, function (cm) {
            return !_.some(sentComments, function (sentCm) {
              return sentCm.body === cm.body && sentCm.sender.id === cm.sender.id;
            })
          });
        }
        vm.activities = vm.activities.concat(newCommentsFromOthers);
        vm.lastComment = findLastComment();
        vm.commentBoardLimit += newComments.length;
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
      NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("Are you sure to remove this comment?")).then(function (result) {
        if (result) {
          NstSvcCommentFactory.removeComment(vm.postId, comment).then(function () {
            NstUtility.collection.dropById(vm.comments, comment.id);
            var canceler = $scope.$emit('comment-removed', {postId: vm.postId, commentId: comment.id});
            eventReferences.push(canceler);
          }).catch(function () {
            toastr.error(NstSvcTranslation.get('Sorry, an error has occured while removing your comment'));
          }).finally(function () {
            vm.commentRemoveProgress = false;
          });
        } else {
          vm.commentRemoveProgress = false;
        }
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
        id: vm.sendCommentCount,
        removed: false,
        removedBy: '',
        removedById: '',
        sender: vm.user,
        senderId: '',
        timestamp: Date.now(),
        indexInComments: ctrlComments().length
      };
      
      if (vm.chainView) {
        commentModel = {
          comment: commentModel,
          id: commentModel.id,
          type: NST_POST_EVENT_ACTION.COMMENT_ADD,
          actor: commentModel.sender,
          timestamp: commentModel.timestamp
        }
      }

      commentModel.isSending = true;
      vm.sendCommentCount++;
      vm.commentBoardLimit++;

      // if (!_.some(vm.comments, {
      //   id: commentModel._id
      // })) {
      // }

      ctrlComments().push(commentModel);

      $timeout(function () {
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
      var index = _.findIndex(ctrlComments(), {id: commentModel.id});
      if (index > -1) {
        if (vm.chainView) {
          ctrlComments()[index].comment.isSending = false;
          ctrlComments()[index].comment.isFailed = true;
        } else {
          ctrlComments()[index].isSending = false;
          ctrlComments()[index].isFailed = true;
        }
      }
      toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
    }

    function addCommentCallback(comment, commentModel) {
      var index = _.findIndex(ctrlComments(), {id: commentModel.id});
      if (_.some(ctrlComments(), {
          id: comment.id
        })) {
        ctrlComments().splice(index, 1);
      } else {
        if (vm.chainView) {
          ctrlComments()[index] = {
            comment: comment,
            id: comment.id,
            type: NST_POST_EVENT_ACTION.COMMENT_ADD,
            actor: comment.sender,
            timestamp: comment.timestamp
          };
        } else {
          ctrlComments()[index] = comment;
        }
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
        NstSvcCommentFactory.addComment(vm.postId, '', attachmentId).then(function (comment) {
          // addCommentCallback(comment)
          ctrlComments().push(comment);
          vm.isSendingComment = false;
          vm.post.newComment = '';
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
          vm.isSendingComment = false;
          vm.post.newComment = '';
        });
      } else {
        NstSvcTaskFactory.addComment(vm.taskId, '', attachmentId).then(function (comment) {
          // addCommentCallback(comment)
          ctrlComments().push(comment);
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
      vm.hasOlderComments = vm.totalCommentsCount > ctrlComments().length;
    }

    function clearCommentBoardLimit() {
      vm.commentBoardLimit = commentBoardMax;
      vm.commentBoardIsRolled = false;
    }

    function findOlder() {
      return _.first(_.orderBy(ctrlComments(), 'timestamp'));
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

    function showActivities() {
      return vm.activitiesActive =! vm.activitiesActive;
    }

    function commentBoardNeedsRolling() {
      return ctrlComments().length > 3;
      // return vm.commentBoardIsRolled === false && vm.comments.length > 3;
    }

    function loadMoreComments() {
      var date = getOlderDate();
      var fn = vm.chainView
      ? NstSvcPostActivityFactory.getActivities({
        postId: vm.postId,
        before: date,
        limit: commentsSettings.limit
      })
      : NstSvcCommentFactory.retrieveComments(vm.postId, {
        date: date,
        limit: commentsSettings.limit
      })
      fn
      .then(function (comments) {

        var orderedItems = reorderComments(comments);
        ctrlComments().unshift.apply(ctrlComments(), orderedItems);
        vm.lastComment = findLastComment();
        vm.hasOlderComments = comments.length === commentsSettings.limit;
        clearCommentBoardLimit();
      }).catch(function () {
        toastr.error('Sorry, an error has occured while loading older comments');
      });
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
