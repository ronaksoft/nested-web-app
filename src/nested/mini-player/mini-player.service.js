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

    function MiniPlayer () {
      audioDOM = document.createElement('audio');
      audioDOM.style.display = 'none';
      document.body.appendChild(audioDOM);

      audioDOM.onended = function () {
        $rootScope.$broadcast('play-audio', '');
      };
    }

    MiniPlayer.prototype.constructor = MiniPlayer;
    MiniPlayer.prototype.addTrack = addTrack;
    MiniPlayer.prototype.play = play;
    MiniPlayer.prototype.pause = pause;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;

    var service = new MiniPlayer();
    return service;

    function addTrack (item) {
      // var alreadyCreated = audioDOMS.find(function (audioDOM) {
      //   return audioDOM.className === item.id;
      // });
      //
      // if (alreadyCreated) {
      //   // alreadyCreated.pause();
      //   // alreadyAdded.remove();
      //   // pauseCallback(false);
      //   // _.remove(audioDOMS, function(n) {
      //   //     return n.className === item.id;
      //   // });
      //   return ;
      // }
      audioObjs.push(item);

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

      this.play(item.id);
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

    function getList () {
      return audioObjs;
    }
  }
})();
