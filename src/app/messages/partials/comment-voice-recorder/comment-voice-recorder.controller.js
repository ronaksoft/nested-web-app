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

  function CommentVoiceRecorderController($scope, $interval, $rootScope, $timeout, SvcRecorder, toastr) {

    var eventReferences = [];
    var vm = this;

    vm.support = false;
    vm.recording = false;
    vm.start = start;
    vm.stop = stop;
    vm.getEqo = getEqo;
    vm.eqo = 0;
    var interval;

    var eqoSetting = {
      min: 15,
      max: 40
    };

    $timeout(function () {
      init();
    }, 100);

    function init() {
      $scope.$apply(function () {
        vm.support = SvcRecorder.support;
      });
    }

    function startInterval() {
      $interval.cancel(interval);
      interval = $interval(function () {
        vm.eqo = Math.floor(Math.random() * 100);
      }, 100);
    }

    function start() {
      vm.recording = true;
      startInterval();
      SvcRecorder.record();
    }

    function stop(event) {
      console.log(event);
      vm.recording = false;
      $interval.cancel(interval);
      vm.eqo = 0;
      SvcRecorder.stop();
    }

    function getEqo(eqo) {
      if (eqo < 0) {
        eqo = 0;
      }
      if (eqo > 100) {
        eqo = 100;
      }
      var radius = (eqo/100) * (eqoSetting.max - eqoSetting.min) + eqoSetting.min;
      return 'height:' + radius + 'px;width:' + radius + 'px';
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
