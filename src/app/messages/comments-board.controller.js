(function() {
  'use strict';

  angular
    .module('nested')
    .controller('CommentsBoardController', CommentsBoardController);

  function CommentsBoardController($rootScope, $scope, $stateParams, $log, $q, $timeout,
    NstSvcPostFactory) {
      var vm = this;
      vm.post = {};
      //vm.comments = {};
      vm.setting = {
        skip : 0,
        limit : 10
      };

      vm.loadMore = loadMore;
      vm.remove = remove;
      vm.send = send;

      function loadMore() {
        vm.loading = true;
        PostFactoryService.retrieveComments(vm.post, vm.setting).then(function (post) {
          vm.post = post;
          vm.loading = false;
        }).catch(function (error) {
          // TODO: create a service that handles errors
          // and knows what to do when an error occurs
        });
      }

      function remove(comment) {
        vm.isRemoving = true;
        PostFactoryService.removeComment(vm.post, comment).then(function(comment) {
          vm.isRemoving = false;
          //notify
        }).catch(function(error) {
          //decide
        });
      }

      /**
      * send - add the comment to the list of the post comments
      *
      * @param  {Event}  e   keypress event handler
      */
      function send(e) {
        if (!sendKeyIsPressed(e)) {
          return;
        }

        var body = extractCommentBody(e);
        if (body.length === 0) {
          return;
        }

        vm.isSending = true;

        PostFactoryService.addComment(vm.post, vm.user, body).then(function(post) {
          vm.post = post;
          e.currentTarget.value = '';
          vm.isSending = false;
          // TODO: notify
        }).catch(function(error) {
          // TODO: decide
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

      function allowToRemoveComment(comment) {
        return comment.sender.username === vm.user.username
          && (Date.now() - comment.date < 20 * 60 * 1e3);
      }

  }

})();
