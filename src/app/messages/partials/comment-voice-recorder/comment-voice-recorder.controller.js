/**
 * @file app/messages/comment-voice-recorder/comment-body.controller.js
 * @desc Controller for comment voice recorder directive
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
    .controller('CommentVoiceRecorderController', CommentVoiceRecorderController);

  function CommentVoiceRecorderController($scope, $interval, $rootScope, $timeout, SvcRecorder, toastr, NstSvcStore, NstSvcAuth, NST_STORE_UPLOAD_TYPE, _) {

    var vm = this;
    var eventReferences = [];

    vm.support = false;
    vm.recording = false;
    vm.recorded = false;
    vm.start = start;
    vm.stop = stop;
    vm.getEqo = getEqo;
    vm.eqo = 0;
    vm.timerCounter = 0;

    var eqoSetting = {
      min: 18,
      max: 40
    };

    init();

    function logoUploadProgress(/*event*/) {
      // var logoUploadedRatio = parseInt((event.loaded / event.total) * 75);
      // console.log(event);
    }

    function init() {
      vm.support = SvcRecorder.support;

      eventReferences.push(SvcRecorder.volumeChanged(function (data) {
        if (!vm.recording) {
          return;
        }
        $scope.$apply(function () {
          vm.eqo = data.volume;
        });
      }));

      eventReferences.push(SvcRecorder.voiceReady(function (data) {
        if (!vm.recorded) {
          return;
        }

        var request = NstSvcStore.uploadWithProgress(data.file, logoUploadProgress,
          NST_STORE_UPLOAD_TYPE.VOICE, NstSvcAuth.lastSessionKey);

        request.finished().then(function (response) {
          vm.sendHandler(response.data.universal_id);
          vm.recorded = false;
          vm.timerCounter = 0;
        }).catch(function () {
          vm.recorded = false;
          vm.timerCounter = 0;
        });
      }));
    }

    function start() {
      if (vm.recording || vm.recorded) {
        if (vm.recording) {
          vm.stop(true);
        }
        return;
      }
      vm.recording = true;
      SvcRecorder.record();
    }

    function stop(force) {
      if (!vm.recording && force !== true) {
        return;
      }
      vm.recording = false;
      vm.eqo = 0;
      if (SvcRecorder.stop()) {
        vm.recorded = true;
      }
    }

    function getEqo(eqo) {
      if (eqo < 0) {
        eqo = 0;
      }
      if (eqo > 100) {
        eqo = 100;
      }
      var radius = (eqo / 100) * (eqoSetting.max - eqoSetting.min) + eqoSetting.min;
      return 'height:' + radius + 'px;width:' + radius + 'px';
    }

    var timerInterval;

    function timerHandler(recording) {
      $interval.cancel(timerInterval);
      if (recording === true && vm.timerCounter === 0) {
        vm.timerCounter = 0;
        timerInterval = $interval(function () {
          vm.timerCounter++;
        }, 1000);
      }
    }

    eventReferences.push($scope.$watch(function () {
      return vm.recording;
    }, function (newVal) {
      timerHandler(newVal);
      if (vm.isRecording !== undefined) {
        vm.isRecording = newVal;
      }
    }));

    $scope.$on('$destroy', function () {
      SvcRecorder.reset();
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
