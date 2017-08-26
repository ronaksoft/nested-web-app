(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstCommentBody', CommentBody);

  /** @ngInject */
  function CommentBody() {
    return {
      restrict: 'E',
      templateUrl: 'app/messages/partials/comment-body/comment-body.html',
      controller: 'CommentBodyController',
      controllerAs: 'ctlCommentBody',
      replace: true,
      bindToController: {
        comment: '='
      }
    };
  }

})();
