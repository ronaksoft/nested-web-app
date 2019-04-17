(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstVoiceComment', nstVoiceComment);

  /** @ngInject */
  function nstVoiceComment() {
    return {
      restrict: 'E',
      templateUrl: 'app/messages/partials/comment-voice/comment-voice.html',
      controller: 'CommentVoiceController',
      controllerAs: 'ctlCommentVoice',
      replace: true,
      bindToController: {
        comment: '=',
        commentBoardId: '='
      }
    };
  }

})();
