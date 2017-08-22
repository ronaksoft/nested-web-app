(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcMiniPlayer', SvcMiniPlayer);

  /** @ngInject */
  function SvcMiniPlayer($rootScope, _) {
    var audioDOM;
    var audioObjs = [];
    var playing = null;
    var audioInterval;

    function MiniPlayer() {
      audioDOM = document.createElement('audio');
      audioDOM.style.display = 'none';
      document.body.appendChild(audioDOM);

      var that = this;

      audioDOM.onended = function () {
        that.currentStatus = 'pause';
        callIfValid(that.statusChangedRef, {
          status: that.currentStatus,
          id: playing,
          playlist: that.playlistName
        });
        that.broadcastStatus('');
      };

      audioInterval = setInterval(function () {
        if (!audioDOM.paused) {
          callIfValid(that.timeChangedRef, {
            time: audioDOM.currentTime,
            duration: audioDOM.duration,
            ratio: (audioDOM.currentTime / audioDOM.duration)
          });
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
    MiniPlayer.currentStatus = 'pause';
    MiniPlayer.statusChangedRef = null;
    MiniPlayer.prototype.statusChanged = statusChanged;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;
    MiniPlayer.prototype.broadcastStatus = broadcastStatus;

    var service = new MiniPlayer();
    return service;

    function setPlaylist(name) {
      if (name !== this.playlistName) {
        this.removeAll();
      }
      this.playlistName = name;
    }

    function addTrack(item, sender) {
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

      this.currentStatus = 'add';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
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
      this.currentStatus = 'play';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
        id: id,
        playlist: this.playlistName
      });
      this.broadcastStatus(id);
    }

    function pause(id) {
      // if (id !== undefined && id !) {
      //   playing = null;
      // }
      audioDOM.pause();
      this.currentStatus = 'pause';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
        id: id,
        playlist: this.playlistName
      });
      this.broadcastStatus('');
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
      this.currentStatus = 'next';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
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
      this.currentStatus = 'prev';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
        id: id,
        playlist: this.playlistName
      });
      this.play(id);
    }

    function seekTo(sec) {
      if (audioDOM.paused) {
        return;
      }
      audioDOM.currentTime = sec;
      this.currentStatus = 'seek';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
        time: sec,
        id: playing,
        playlist: this.playlistName
      });
    }

    function timeChanged(callback) {
      if (_.isFunction(callback)) {
        this.timeChangedRef = callback;
      }
    }

    function statusChanged(callback) {
      if (_.isFunction(callback)) {
        this.statusChangedRef = callback;
      }
    }

    function removeAll() {
      audioDOM.pause();
      audioObjs = [];
      playing = null;
      this.currentStatus = 'pause';
      callIfValid(this.statusChangedRef, {
        status: this.currentStatus,
        id: null,
        playlist: this.playlistName
      });
      this.broadcastStatus('');
    }

    function getCurrent() {
      var index = _.findIndex(audioObjs, function (o) {
        return o.id === playing
      });

      return {
        item: audioObjs[index],
        status: this.currentStatus,
        prev: (index === 0) ? false : true,
        next: (index === (audioObjs.length - 1)) ? false : true,
        index: index
      };
    }

    function listUpdated(callback) {
      if (_.isFunction(callback)) {
        this.listUpdatedRef = callback;
      }
    }

    function getList() {
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

    function broadcastStatus(id) {
      if (this.playlistName === undefined || this.playlistName === null) {
        return;
      }
      $rootScope.$broadcast('play-audio', this.playlistName + '_' + id);
    }
  }
})();
