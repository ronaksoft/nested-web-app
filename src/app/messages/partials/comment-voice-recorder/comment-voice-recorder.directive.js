(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstVoiceCommentRecorder', nstVoiceCommentRecorder);

  /** @ngInject */
  function nstVoiceCommentRecorder() {
    return {
      restrict: 'E',
      templateUrl: 'app/messages/partials/comment-voice-recorder/comment-voice-recorder.html',
      controller: 'CommentVoiceRecorderController',
      controllerAs: 'ctrlRecorder',
      bindToController: {
        comment: '=',
        commentBoardId: '=',
        sendHandler: '=?',
        isRecording: '=?'
      }
    };
  }

})();
