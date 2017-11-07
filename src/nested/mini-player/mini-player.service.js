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
    var audioInterval, audioIntervalEnable = false;

    function MiniPlayer() {
      audioDOM = document.createElement('audio');
      audioDOM.style.display = 'none';
      document.body.appendChild(audioDOM);

      var that = this;

      audioDOM.onended = function () {
        that.currentStatus = 'end';
        _.forEach(that.statusChangedRef, function (item) {
          callIfValid(item, {
            status: that.currentStatus,
            id: playing,
            playlist: that.playlistName
          });
        });
        that.broadcastStatus('');
      };
    }

    MiniPlayer.prototype.constructor = MiniPlayer;
    MiniPlayer.prototype.startInterval = startInterval;
    MiniPlayer.prototype.stopInterval = stopInterval;
    MiniPlayer.playlistName = null;
    MiniPlayer.prototype.setPlaylist = setPlaylist;
    MiniPlayer.prototype.addTrack = addTrack;
    MiniPlayer.prototype.play = play;
    MiniPlayer.prototype.pause = pause;
    MiniPlayer.prototype.next = next;
    MiniPlayer.prototype.prev = prev;
    MiniPlayer.prototype.seekTo = seekTo;
    MiniPlayer.timeChangedRef = [];
    MiniPlayer.prototype.timeChanged = timeChanged;
    MiniPlayer.listUpdatedRef = [];
    MiniPlayer.prototype.listUpdated = listUpdated;
    MiniPlayer.currentStatus = 'pause';
    MiniPlayer.statusChangedRef = [];
    MiniPlayer.prototype.statusChanged = statusChanged;
    MiniPlayer.prototype.removeAll = removeAll;
    MiniPlayer.prototype.getCurrent = getCurrent;
    MiniPlayer.prototype.getList = getList;
    MiniPlayer.prototype.broadcastStatus = broadcastStatus;
    MiniPlayer.prototype.getStatus = getStatus;

    var service = new MiniPlayer();
    return service;

    function startInterval() {
      if (audioIntervalEnable) {
        return;
      }
      audioIntervalEnable = true;
      var that = this;
      audioInterval = setInterval(function () {
        if (!audioDOM.paused) {
          _.forEach(that.timeChangedRef, function (item) {
            callIfValid(item, {
              time: audioDOM.currentTime,
              duration: audioDOM.duration,
              ratio: (audioDOM.currentTime / audioDOM.duration)
            });
          });
        }
      }, 500);
    }

    function stopInterval() {
      if (audioInterval) {
        clearInterval(audioInterval);
        audioIntervalEnable = false;
      }
    }

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
        _.forEach(this.listUpdatedRef, function (item) {
          callIfValid(item);
        });
      }

      this.currentStatus = 'add';
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: item.id,
          playlist: that.playlistName
        });
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
      this.startInterval();
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
      setTimeout(function () {
        audioDOM.play();
      }, 100);
      this.currentStatus = 'play';

      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: id,
          playlist: that.playlistName
        });
      });
      this.broadcastStatus(id);
    }

    function pause(id) {
      this.stopInterval();
      audioDOM.pause();
      this.currentStatus = 'pause';
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: id,
          playlist: that.playlistName
        });
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
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: id,
          playlist: that.playlistName
        });
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
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: id,
          playlist: that.playlistName
        });
      });
      this.play(id);
    }

    function seekTo(sec) {
      if (audioDOM.paused) {
        return;
      }
      audioDOM.currentTime = sec;
      this.currentStatus = 'seek';
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          time: sec,
          id: playing,
          playlist: that.playlistName
        });
      });
    }

    function unbindFn(list, id) {
      var index = _.findIndex(list, {id: id});
      if (index > -1) {
        list.splice(index, 1);
      }
    }

    function timeChanged(callback) {
      if (_.isFunction(callback)) {
        var id = _.uniqueId();
        var fnRef = this.timeChangedRef;
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

    function statusChanged(callback) {
      if (_.isFunction(callback)) {
        var id = _.uniqueId();
        var fnRef = this.statusChangedRef;
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

    function removeAll() {
      audioDOM.pause();
      audioObjs = [];
      playing = null;
      this.currentStatus = 'pause';
      var that = this;
      _.forEach(this.statusChangedRef, function (item) {
        callIfValid(item, {
          status: that.currentStatus,
          id: null,
          playlist: that.playlistName
        });
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
        playlist: this.playlistName,
        prev: (index === 0) ? false : true,
        next: (index === (audioObjs.length - 1)) ? false : true,
        index: index
      };
    }

    function listUpdated(callback) {
      if (_.isFunction(callback)) {
        var id = _.uniqueId();
        var fnRef = this.listUpdatedRef;
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

    function getStatus() {
      if (this.playlistName === undefined || this.playlistName === null) {
        return '';
      }
      return this.playlistName + '_' + playing;
    }
  }
})();
