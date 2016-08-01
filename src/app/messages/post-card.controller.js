(function() {
  'use strict';

  angular
    .module('nested')
    .controller('PostCardController', PostCardController);

  function PostCardController($rootScope, $scope, $state, $stateParams, $log, $q, $timeout,
    NstSvcServer, NstSvcCommentFactory, NstSvcPostFactory, NstSvcPostMap, NstSvcCommentMap, NstSvcPostStorage,
    NST_EVENT_ACTION, NST_SRV_EVENT) {
    var vm = this;
    var commentBoardMin = 3;
    var commentBoardMax = 99;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.commentsBoardPreview = false;
    vm.urls = {
      reply_all: $state.href('compose-reply-all', {
        postId: vm.post.id
      }),
      reply_sender: $state.href('compose-reply-sender', {
        postId: vm.post.id
      }),
      forward: $state.href('compose-forward', {
        postId: vm.post.id
      })
    };

    var commentsSettings = {
      limit : 8,
      date : null
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.reply = reply;
    vm.toggleCommentsBorad = toggleCommentsBorad;
    vm.sendComment = sendComment;
    vm.attachmentClick = attachmentClick;

    vm.commentBoardLimit = commentBoardMin;
    vm.hasOlderComments = true;
    vm.commentBoardIsRolled = null;
    vm.showOlderComments = showOlderComments;
    vm.limitCommentBoard = limitCommentBoard;
    vm.canShowOlderComments = canShowOlderComments;




    function reply() {
      $debug.log('Is not implemented yet!')
    }

    function toggleCommentsBorad() {
      vm.commentsBoardPreview = !vm.commentsBoardPreview;
    }

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    function sendComment(e) {
      if (!sendKeyIsPressed(e)) {
        return;
      }

      var body = extractCommentBody(e);
      if (body.length === 0) {
        return;
      }

      vm.isSending = true;

      NstSvcPostFactory.get(vm.post.id).then(function(post) {
        NstSvcCommentFactory.addComment(post, body).then(function (comment) {
          e.currentTarget.value = '';
          vm.isSending = false;
        }).catch(function (error) {
          $log.debug(error);
        });
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

    //TODO put it in directive ...
    vm.languageIsRtl = function (str) {
      str = str.trim();
      var charCode = str.charCodeAt(0);

      return charCode > 1300 && 1700 > charCode;
    };

    function attachmentClick(item) {

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
      var date = oldest ? oldest.date : post.date;

      return date.subtract(1, 'ms').format('x');
    }

    function showOlderComments() {
      if (vm.commentBoardIsRolled === true) {
        clearCommentBoardLimit();
      } else {
        loadMoreComments();
      }
    }

    function canShowOlderComments() {
      return vm.hasOlderComments || vm.commentBoardIsRolled === true;
    }

    function loadMoreComments() {
      var date = getDateOfOldestComment(vm.post);

      NstSvcPostFactory.get(vm.post.id).then(function (post) {
        console.log('post is : ', post);
        return NstSvcCommentFactory.retrieveComments(post, {
          date : date,
          limit : commentsSettings.limit
        });
      }).then(function (comments) {
        console.log('new comments are :', comments);

        if (comments.length < commentsSettings.limit) {
          vm.hasOlderComments = false;
        } else {
          vm.hasOlderComments = true;
        }

        var commentItems = _.orderBy(_.map(comments, NstSvcCommentMap.toMessageComment), 'date', 'asc');
        vm.post.comments = _.concat(commentItems, vm.post.comments);
        clearCommentBoardLimit();

      }).catch(function (error) {
        $log.debug(error);
      });
    }

    NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function(e) {
      switch (e.detail.timeline_data.action) {
        case NST_EVENT_ACTION.COMMENT_ADD:
        var postId = e.detail.timeline_data.post_id.$oid;

        if (vm.post.id == postId) {
          var commentId = e.detail.timeline_data.comment_id.$oid;
          NstSvcPostFactory.get(postId).then(function(post) {
              NstSvcCommentFactory.getComment(commentId, postId).then(function (comment) {
                  var result = post.addComment(comment);
                  if (result) {
                    NstSvcPostStorage.set(post.id, post);
                    vm.commentBoardLimit = vm.commentBoardLimit + 1;
                    vm.post.comments.push(NstSvcCommentMap.toMessageComment(comment));
                  }
              }).catch(function (error) {
                $log.debug(error);
              });
          }).catch(function(error) {
            $log.debug(error);
          });
        }

        break;
      }
    });
  }

})();
