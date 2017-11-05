/**
 * @file app/messages/comment-body/comment-body.controller.js
 * @desc Controller for comment body directive
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-08-26
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('CommentVoiceController', CommentVoiceController);

  function CommentVoiceController($scope, $sce, $q, $filter, _, NstSvcFileFactory, NstSvcAttachmentFactory, SvcMiniPlayer, NstSvcStore, NST_STORE_ROUTE, toastr) {
    var vm = this;
    vm.playVoice = playVoice;
    vm.voice;

    vm.parts = [];

    init();

    function init() {
      NstSvcAttachmentFactory.getOne(vm.comment.attachment_id).then(function (attachment) {
        console.log(attachment);
        vm.voice = attachment;
      })
    }

    function getToken(id) {
      var deferred = $q.defer();
      NstSvcFileFactory.getDownloadToken(id, vm.commentBoardId).then(deferred.resolve).catch(deferred.reject).finally(function () {});

      return deferred.promise;
    }

    function playVoice() {
      getToken(vm.voice.id).then(function (token) {
        vm.voice.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, vm.voice.id, token);
        vm.voice.isVoice = vm.voice.uploadType === "VOICE";
        vm.voice.isPlayed = true;
        vm.voice.sender = vm.comment.sender;
        console.log(vm.voice);
      }).catch(function () {
        toastr.error('Sorry, An error has occured while playing the audio');
      });
    }
    $scope.to_trusted = function (html_code) {
      return $sce.trustAsHtml(html_code);
    };
  }
})();
