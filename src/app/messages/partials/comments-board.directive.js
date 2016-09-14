(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('commentsBoard', comment);

  /**
   * array of comments that comments-board.controller.js controls the them all
   */
  function comment() {
    return {
      restrict: 'E',
      scope:{},
      link: function(scope, elem, attrs) {
      },
      templateUrl: 'app/messages/partials/message/comment.html',
      controller: 'CommentsBoardController',
      controllerAs: 'ctlComments',
      bindToController: {
        comments: '=comments',
        limit: '=limit'
      }
    };
  }

})();
