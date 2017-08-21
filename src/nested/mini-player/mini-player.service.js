(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcMiniPlayer', SvcMiniPlayer);

  /** @ngInject */
  function SvcMiniPlayer($rootScope,$window,deviceDetector,$timeout, NstSvcFileFactory, NstSvcStore, _) {
    var obj = {},
      audioDOMS= [],
      audioObjs = [],
      currentlyPlay;

    function MiniPlayer () {

    }

    MiniPlayer.prototype.constructor = MiniPlayer;

    MiniPlayer.prototype.addTrack = addTrack;
    MiniPlayer.prototype.play = play;
    MiniPlayer.prototype.pause = pause;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;

    function addTrack (item) {
      var alreadyCreated = audioDOMS.find(function (audioDOM) {
        return audioDOM.className === item.id;
      });

      if (alreadyCreated) {
        // alreadyCreated.pause();
        // alreadyAdded.remove();
        // pauseCallback(false);
        // _.remove(audioDOMS, function(n) {
        //     return n.className === item.id;
        // });
        return ;
      }
      audioObjs.push(item);

      var audio = document.createElement('audio');
      audio.style.display = 'none';
      audio.className = item.id;
      audio.autoplay = item.isPlayed ? true : false;
      audio.src = item.src;
      document.body.appendChild(audio);

      audioDOMS.push(audio);

      audio.onended = function(){
        // audio.remove() //Remove when played.
        $rootScope.$broadcast('play-audio', '');
        // _.remove(audioDOMS, function(n) {
        //     return n.className === item.id;
        // });
      };
    }

    function play (id) {
      currentlyPlay = id;
      var DOM = audioDOMS.find(function (audioDOM) {
        return audioDOM.className === id;
      });
      DOM.play();
      $rootScope.$broadcast('play-audio', id);
    }

    function pause (id) {
      currentlyPlay = '';
      var DOM = audioDOMS.find(function (audioDOM) {
        return audioDOM.className === id;
      });
      DOM.pause();
      $rootScope.$broadcast('play-audio', '');
    }

    function removeAll () {
      audioDOMS.forEach(function (i){
        i.pause();
        i.remove();
      });
      audioDOMS = [];
      audioObjs = [];
      $rootScope.$broadcast('play-audio', '');
    }

    function getCurrent () {
      var index = _.findIndex(obj.audioObjs, function (o) {
        return o.id === obj.currentlyPlay
      });
      return {
        item : obj.audioObjs[index],
        index : index
      }
    }

    function getList () {
      return audioObjs;
    }

    return MiniPlayer;
  }
})();
