(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcRecorder', SvcRecorder);

  /** @ngInject */
  function SvcRecorder($rootScope, _) {

    var constraints = {
      audio: true
    };
    var chunks = [];
    var mediaRecorder;

    var onSuccess = function(stream) {
      service.canRecord = true;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.onstop = function(e) {
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        chunks = [];
        var audioURL = window.URL.createObjectURL(blob);
        var audio = document.createElement('audio');
        audio.autoplay = true;
        audio.src = audioURL;
        console.log(audio);
      };

      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      }
    };

    function Recorder() {
      navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      if (navigator.getUserMedia) {
        this.support = true;
      }
    }

    Recorder.prototype.constructor = Recorder;
    Recorder.prototype.support = false;
    Recorder.prototype.canRecord = false;
    Recorder.prototype.record = record;
    Recorder.prototype.stop = stop;

    var service = new Recorder();
    return service;

    function record() {
      navigator.mediaDevices.getUserMedia(constraints).then(
        onSuccess,
        function () {
          service.canRecord = false;
        }
      );
    }

    function stop() {
      if (!service.canRecord) {
        return;
      }
      mediaRecorder.stop();
    }


    // Recorder.prototype.startInterval = startInterval;

  }
})();
