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

  function CommentVoiceController($scope, $rootScope, $sce, $q, $filter, _, NstSvcFileFactory, NstSvcAttachmentFactory,
                                  SvcMiniPlayer, NstSvcStore, NST_STORE_ROUTE, toastr, NstSvcTranslation) {

    var eventReferences = [];
    var vm = this;
    vm.playVoice = playVoice;
    vm.barClick = barClick;
    var currentPlayingId = -1;
    var downloadToken = null;
    vm.fileCorrupted = false;
    vm.playStatus = false;
    vm.voice = null;
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
        eventHandlers();
      }).catch(function () {
        vm.fileCorrupted = true;
      });
    }

    function addToPlayer(data) {
      if (data.postId === vm.commentBoardId) {
        currentPlayingId = data.voiceId;
        SvcMiniPlayer.setPlaylist('voice-comment-' + vm.commentBoardId, true);
        addToPlaylist(data.voiceId);
      }
    }

    function getToken(id) {
      var deferred = $q.defer();

      NstSvcFileFactory.getDownloadToken(id, vm.commentBoardId).then(function(token) {
        downloadToken = token;
        deferred.resolve(downloadToken);
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function addToPlaylist(voiceId) {
      if (downloadToken === null) {
        getToken(vm.voice.id).then(function (token) {
          vm.voice.src = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, vm.voice.id, token);
          vm.voice.isVoice = vm.voice.uploadType === 'VOICE';
          vm.voice.isPlayed = (voiceId === vm.voice.id);
          vm.voice.sender = vm.comment.sender;
          SvcMiniPlayer.addTrack(vm.voice, vm.comment.sender, vm.comment.timestamp);
        }).catch(function () {
          toastr.error('Sorry, An error has occurred while playing the audio');
        });
      } else {
        vm.voice.isPlayed = (voiceId === vm.voice.id);
        SvcMiniPlayer.addTrack(vm.voice, vm.comment.sender, vm.comment.timestamp);
      }
    }

    function playVoice() {
      if (vm.fileCorrupted) {
        toastr.warning(NstSvcTranslation.get('Voice comment file is corrupted!'));
        return;
      }
      if (vm.voice === null) {
        return;
      }
      if (!vm.playStatus) {
        $rootScope.$broadcast('play-voice-comment', {
          postId: vm.commentBoardId,
          voiceId: vm.comment.attachmentId
        });
      } else {
        SvcMiniPlayer.pause();
      }
    }

    function barClick(newRatio) {
      var setTime = vm.currentTime.duration * newRatio;
      vm.currentTime.ratio = newRatio;
      SvcMiniPlayer.seekTo(setTime);
    }

    function eventHandlers() {
      eventReferences.push($rootScope.$on('play-voice-comment', function (event, data) {
        addToPlayer(data);
      }));

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

        if (result.status === 'play' || result.status === 'pause' || result.status === 'end') {
          vm.playStatus = (result.status === 'play' && currentPlayingId === vm.voice.id);
        }

        if (currentPlayingId === vm.voice.id && result.status === 'end') {
          $scope.$apply(function () {
            vm.currentTime = {
              time: 0,
              ratio: 1
            };
          });
          SvcMiniPlayer.next();
        }
      }));
    }

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
