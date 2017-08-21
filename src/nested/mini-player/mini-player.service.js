(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcMiniPlayer', SvcMiniPlayer);

  /** @ngInject */
  function SvcMiniPlayer($rootScope,$window,deviceDetector,$timeout, NstSvcFileFactory, NstSvcStore, _) {
    var audioDOM;
    var audioObjs = [];
    var playing = null;
    var audioInterval;

    function MiniPlayer () {
      audioDOM = document.createElement('audio');
      audioDOM.style.display = 'none';
      document.body.appendChild(audioDOM);

      audioDOM.onended = function () {
        $rootScope.$broadcast('play-audio', '');
      };

      var that = this;
      audioInterval = setInterval(function () {
        if (!audioDOM.paused) {
          callIfValid(that.timeChangedRef, audioDOM.currentTime);
        }
      }, 500);
    }

    MiniPlayer.prototype.constructor = MiniPlayer;
    MiniPlayer.playlistName = null;
    MiniPlayer.prototype.setPlaylist = setPlaylist;
    MiniPlayer.prototype.addTrack = addTrack;
    MiniPlayer.prototype.play = play;
    MiniPlayer.prototype.pause = pause;
    MiniPlayer.prototype.next = next;
    MiniPlayer.prototype.prev = prev;
    MiniPlayer.prototype.seekTo = seekTo;
    MiniPlayer.timeChangedRef = null;
    MiniPlayer.prototype.timeChanged = timeChanged;
    MiniPlayer.listUpdatedRef = null;
    MiniPlayer.prototype.listUpdated = listUpdated;
    MiniPlayer.statusChangedRef = null;
    MiniPlayer.prototype.statusChanged = statusChanged;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;

    var service = new MiniPlayer();
    return service;

    function setPlaylist(name) {
      if (name !== this.playlistName) {
        this.removeAll();
      }
      this.playlistName = name;
    }

    function addTrack (item, sender) {
      var alreadyCreated = audioObjs.find(function (element) {
        return element.id === item.id;
      });

      if (!alreadyCreated) {
        if (sender !== null) {
          item = _.merge(item, {
            sender: sender
          });
        }
        audioObjs.push(item);
        callIfValid(this.listUpdatedRef);
      }

      callIfValid(this.statusChangedRef, {
        status: 'add',
        id: item.id,
        playlist: this.playlistName
      });

      if (item.isPlayed) {
        this.play(item.id);
      }
    }

    function play(id) {
      if (playing !== null) {
        var playingItem = this.getCurrent();
        this.pause(playingItem.item.id);
      }
      var noIdFlag = false;
      if (id === undefined) {
        id = playing;
        noIdFlag = true;
      } else {
        playing = id;
      }
      var index = _.findIndex(audioObjs, function (o) {
        return o.id === id
      });
      if (!noIdFlag) {
        audioDOM.src = audioObjs[index].src;
        audioDOM.load();
      }
      audioDOM.play();
      callIfValid(this.statusChangedRef, {
        status: 'play',
        id: id,
        playlist: this.playlistName
      });
      $rootScope.$broadcast('play-audio', id);
    }

    function pause (id) {
      // if (id !== undefined && id !) {
      //   playing = null;
      // }
      audioDOM.pause();
      callIfValid(this.statusChangedRef, {
        status: 'pause',
        id: id,
        playlist: this.playlistName
      });
      $rootScope.$broadcast('play-audio', '');
    }

    function next() {
      if (playing !== null) {
        var playingItem = this.getCurrent();
      }
      var index = playingItem.index;
      index++;
      if (index >= audioObjs.length) {
        return;
      }
      var id = audioObjs[index].id;
      callIfValid(this.statusChangedRef, {
        status: 'next',
        id: id,
        playlist: this.playlistName
      });
      this.play(id);
    }

    function prev() {
      if (playing !== null) {
        var playingItem = this.getCurrent();
      }
      var index = playingItem.index;
      index--;
      if (index < 0) {
        return;
      }
      var id = audioObjs[index].id;
      callIfValid(this.statusChangedRef, {
        status: 'prev',
        id: id,
        playlist: this.playlistName
      });
      this.play(id);
    }

    function seekTo (id, sec) {
      audioDOM.currentTime = sec;
      callIfValid(this.statusChangedRef, {
        status: 'seek',
        time: sec,
        id: id,
        playlist: this.playlistName
      });
    }

    function timeChanged (callback) {
      if (_.isFunction(callback)) {
        this.timeChangedRef = callback;
      }
    }

    function statusChanged (callback) {
      if (_.isFunction(callback)) {
        this.statusChangedRef = callback;
      }
    }

    function removeAll () {
      audioDOM.pause();
      audioObjs = [];
      playing = null;
      callIfValid(this.statusChangedRef, {
        status: 'pause',
        id: null,
        playlist: this.playlistName
      });
      $rootScope.$broadcast('play-audio', '');
    }

    function getCurrent () {
      var index = _.findIndex(audioObjs, function (o) {
        return o.id === playing
      });

      return {
        item : audioObjs[index],
        prev: (index === 0) ? false : true,
        next: (index === (audioObjs.length - 1))? false : true,
        index : index
      };
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
