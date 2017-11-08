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

  function CommentVoiceController($scope, $sce, $q, $filter, _, NstSvcFileFactory, NstSvcAttachmentFactory,
                                  SvcMiniPlayer, NstSvcStore, NST_STORE_ROUTE, toastr) {

    var eventReferences = [];
    var vm = this;
    vm.playVoice = playVoice;
    vm.barClick = barClick;
    var currentPlayingId = -1;
    vm.playStatus = false;
    vm.voice = {};
    vm.currentTime = {
      time: 0,
      duration: 100,
      ratio: 0
    };
    vm.parts = [];

    init();

    function init() {
      NstSvcAttachmentFactory.getOne(vm.comment.attachmentId).then(function (attachment) {
        vm.voice = attachment;
        addToPlaylist();
      })
    }

    function getToken(id) {
      var deferred = $q.defer();
      NstSvcFileFactory.getDownloadToken(id, vm.commentBoardId).then(deferred.resolve).catch(deferred.reject);

      return deferred.promise;
    }

    function addToPlaylist() {
      getToken(vm.voice.id).then(function (token) {
        vm.voice.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, vm.voice.id, token);
        vm.voice.isVoice = vm.voice.uploadType === 'VOICE';
        vm.voice.isPlayed = false;
        vm.voice.sender = vm.comment.sender;
        SvcMiniPlayer.addTrack(vm.voice, vm.comment.sender, vm.comment.timestamp);
      }).catch(function () {
        toastr.error('Sorry, An error has occurred while playing the audio');
      });
    }

    function playVoice() {
      if (!vm.playStatus) {
        SvcMiniPlayer.play(vm.voice.id);
      } else {
        SvcMiniPlayer.pause();
      }
    }

    function barClick(newRatio) {
      var setTime = vm.currentTime.duration * newRatio;
      vm.currentTime.ratio = newRatio;
      SvcMiniPlayer.seekTo(setTime);
    }

    eventReferences.push(SvcMiniPlayer.timeChanged(function (t) {
      if (currentPlayingId !== vm.voice.id) {
        return;
      }
      $scope.$apply(function () {
        vm.currentTime = t;
      });
    }));

    eventReferences.push(SvcMiniPlayer.statusChanged(function (result) {
      if (result.status === 'play' || result.status === 'end') {
        currentPlayingId = result.id;
      }

      if (currentPlayingId !== vm.voice.id) {
        return;
      }

      vm.playStatus = result.status === 'play';

      if (result.status === 'play' || result.status === 'pause') {
      } else if (result.status === 'end') {
        $scope.$apply(function () {
          vm.currentTime = {
            time: 0,
            ratio: 1
          };
        });
        SvcMiniPlayer.next();
      }
    }));

    $scope.to_trusted = function (html_code) {
      return $sce.trustAsHtml(html_code);
    };

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
