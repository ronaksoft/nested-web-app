(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcRecorder', SvcRecorder);

  /** @ngInject */
  function SvcRecorder($rootScope, _) {

    var interval;
    var constraints = {
      audio: true
    };
    var chunks = [];
    var mediaRecorder;
    var localStream;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var realVisualize = false;
    if (audioCtx) {
      realVisualize = true;
    }
    var bufferLength;
    var dataArray;
    var recording = false;

    function blobToFile(blob, fileName) {
      return new File([blob], fileName, {type: 'audio/webm', lastModified: Date.now(), duration: 10000000});
    }

    function getAverageVolume(array) {
      var values = 0;
      var average;
      var length = array.length;
      // get all the frequency amplitudes
      for (var i = 0; i < length; i++) {
        values += array[i];
      }
      average = values / length;
      return average;
    }

    function normalize(x) {
      x = -0.0204398621181*x*x + 2.87341884341*x;
      if (x < 0) {
        x = 0;
      }
      if (x > 100) {
        x = 100;
      }
      return Math.floor(x);
    }

    function visualize(stream) {
      if (realVisualize) {
        var source = audioCtx.createMediaStreamSource(stream);
        var analyser = audioCtx.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 2048;
        source.connect(analyser);
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      }
      clearInterval(interval);
      interval = setInterval(function () {
        var volume;
        if (realVisualize) {
          analyser.getByteFrequencyData(dataArray);
          volume = normalize(getAverageVolume(dataArray));
        } else {
          volume = normalize(Math.random() * 100);
        }
        _.forEach(service.volumeChangedRef, function (item) {
          callIfValid(item.fn, {
            volume: volume
          });
        });
      }, 100);
    }

    var onSuccess = function (stream) {
      service.canRecord = true;
      localStream = stream;
      //stopping the stream
      if (!stream.stop && stream.getTracks) {
        stream.stop = function () {
          this.getTracks().forEach(function (track) {
            track.stop();
          });
        };
      }
      mediaRecorder = new MediaRecorder(stream, {
        mimeType : 'audio/webm'
      });
      visualize(stream);
      mediaRecorder.start();

      mediaRecorder.onstop = function (e) {
        var blob = new Blob(chunks, {'type': 'audio/webm;'});
        chunks = [];
        localStream.stop();
        clearInterval(interval);
        recording = false;
        var fileName = 'VOC_' + (new Date().getTime()) + '.ogg';
        var file = blobToFile(blob, fileName);
        _.forEach(service.voiceReadyRef, function (item) {
          callIfValid(item.fn, {
            file: file
          });
        });
      };

      mediaRecorder.ondataavailable = function (e) {
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
    Recorder.prototype.volumeChangedRef = [];
    Recorder.prototype.volumeChanged = volumeChanged;
    Recorder.prototype.voiceReadyRef = [];
    Recorder.prototype.voiceReady = voiceReady;

    var service = new Recorder();
    return service;

    function record() {
      if (recording) {
        return false;
      }
      navigator.mediaDevices.getUserMedia(constraints).then(
        onSuccess,
        function () {
          service.canRecord = false;
        }
      );
      return true;
    }

    function stop() {
      if (!service.canRecord) {
        return;
      }
      mediaRecorder.stop();
    }

    function unbindFn(list, id) {
      var index = _.findIndex(list, {id: id});
      if (index > -1) {
        list.splice(index, 1);
      }
    }

    function volumeChanged(callback) {
      if (_.isFunction(callback)) {
        var id = _.uniqueId();
        var fnRef = this.volumeChangedRef;
        fnRef.push({
          id: id,
          fn: callback
        });

        return function () {
          var tempId = id;
          unbindFn(fnRef, tempId);
        };
      }
    }

    function voiceReady(callback) {
      if (_.isFunction(callback)) {
        var id = _.uniqueId();
        var fnRef = this.voiceReadyRef;
        fnRef.push({
          id: id,
          fn: callback
        });

        return function () {
          var tempId = id;
          unbindFn(fnRef, tempId);
        };
      }
    }

    function callIfValid() {
      if (_.isFunction(arguments[0])) {
        var func = arguments[0];
        var param = null;
        if (arguments.length > 1) {
          param = arguments[1];
        }
        func(param);
      }
    }

  }
})();
