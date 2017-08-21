(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcMiniPlayer', SvcMiniPlayer);

  /** @ngInject */
  function SvcMiniPlayer($rootScope,$window,deviceDetector,$timeout, NstSvcFileFactory, NstSvcStore, _) {
    var audioDOM;
    var audioObjs = [];
    var currentlyPlay = null;
    var audioInterval;

    function MiniPlayer () {
      audioDOM = document.createElement('audio');
      audioDOM.style.display = 'none';
      document.body.appendChild(audioDOM);

      audioDOM.onended = function () {
        $rootScope.$broadcast('play-audio', '');
      };

      audioInterval = setInterval(function () {
        if (!audioDOM.paused) {
          console.log(audioDOM.currentTime);
          callIfValid(this.timeChanedRef, audioDOM.currentTime);
        }
      }, 500);
    }

    MiniPlayer.prototype.constructor = MiniPlayer;
    MiniPlayer.prototype.addTrack = addTrack;
    MiniPlayer.prototype.play = play;
    MiniPlayer.prototype.pause = pause;
    MiniPlayer.timeChanedRef = null;
    MiniPlayer.prototype.timeChaned = timeChanged;
    MiniPlayer.listUpdatedRef = null;
    MiniPlayer.prototype.listUpdated = listUpdated;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;

    var service = new MiniPlayer();
    return service;

    function addTrack (item) {
      var alreadyCreated = audioObjs.find(function (element) {
        return element.id === item.id;
      });

      if (alreadyCreated) {
        return ;
      }

      audioObjs.push(item);
      callIfValid(this.listUpdatedRef);

      // var audio = document.createElement('audio');
      // audio.style.display = 'none';
      // audio.className = item.id;
      // audio.autoplay = item.isPlayed ? true : false;
      // audio.src = item.src;
      // document.body.appendChild(audio);

      audioDOM.className = item.id;
      audioDOM.autoplay = item.isPlayed ? true : false;
      audioDOM.src = item.src;
      audioDOM.load();

      // audioDOMS.push(audio);

      // if (item.isPlayed) {
        this.play(item.id);
      // }
    }

    function play (id) {
      if (currentlyPlay !== null) {
        var playingItem = this.getCurrent();
        this.pause(playingItem.item.id);
      }
      currentlyPlay = id;
      // var DOM = audioDOMS.find(function (audioDOM) {
      //   return audioDOM.className === id;
      // });
      audioDOM.play();
      console.log(id, 'is playing');
      $rootScope.$broadcast('play-audio', id);
    }

    function pause (id) {
      currentlyPlay = '';
      audioDOM.pause();
      $rootScope.$broadcast('play-audio', '');
    }

    function timeChanged (callback) {
      if (_.isFunction(callback)) {
        this.timeChanedRef = callback;
      }
    }

    function removeAll () {
      audioDOM.pause();

      audioObjs = [];
      $rootScope.$broadcast('play-audio', '');
    }

    function getCurrent () {
      var index = _.findIndex(audioObjs, function (o) {
        return o.id === currentlyPlay
      });
      return {
        item : audioObjs[index],
        index : index
      }
    }

    function listUpdated (callback) {
      if (_.isFunction(callback)) {
        this.listUpdatedRef = callback;
      }
    }

    function getList () {
      return audioObjs;
    }

    function callIfValid() {
      if (_.isFunction(arguments[0])) {
        var param = null;
        if (arguments.length > 1) {
          param = arguments.shift();
        }
        arguments[0]();
      }
    }
  }
})();
