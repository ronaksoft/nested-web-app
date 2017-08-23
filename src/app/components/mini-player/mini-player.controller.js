(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.navbar')
      .controller('MiniPlyerController', MiniPlyerController);

    /** @ngInject */
    function MiniPlyerController($scope, $rootScope, $state, _, SvcMiniPlayer, $) {
      var vm = this;
      vm.displayState = 0;
      vm.playPauseToggle = playPauseToggle;
      vm.closePlayer = closePlayer;
      vm.next = next;
      vm.previous = previous;
      vm.play = play;
      vm.pause = pause;
      vm.openList = openList;
      vm.barClick = barClick;
      vm.gotoPost = gotoPost;
      vm.playStatus = false;
      vm.playList = [];
      vm.isVoice = false;
      vm.currentTime = {};
      vm.currentTimeString = ' 00:00'

      var updateDebounce = _.debounce(update, 50);

      vm.currentPlay = {
        item: {},
        playlist: null,
        index : 0
      };


      SvcMiniPlayer.timeChanged(function (t) {
        $scope.$apply(function () {
          vm.currentTime = t;
        });
      });

      SvcMiniPlayer.statusChanged(function (result) {
        vm.playStatus = result.status === 'play';
        if (result.status === 'play' || result.status === 'pause') {
          updateDebounce();
        } else if (result.status === 'end') {
          $scope.$apply(function () {
            vm.currentTime = {
              time: 0,
              ratio: 1
            };
          });
        }
      });

      SvcMiniPlayer.listUpdated(function () {
        updateDebounce();
      });

      function update() {
        getCurrent();
        getList()
      }

      function barClick(e) {
        var barWidth = e.currentTarget.clientWidth;
        var x = e.clientX - $(e.currentTarget).offset().left;
        var newRatio = x / barWidth;
        var setTime = vm.currentTime.duration * newRatio;
        vm.currentTime.ratio = newRatio;
        SvcMiniPlayer.seekTo(setTime);
      }


      function getCurrent() {
        $scope.$apply(function () {
          vm.currentPlay = SvcMiniPlayer.getCurrent();
          // console.log(vm.currentPlay);
          if (vm.currentPlay.item) {
            vm.isVoice = vm.currentPlay.item.uploadType !== "AUDIO";
          }
        });
      }

      function getList() {
          $scope.$apply(function () {
            vm.playList = SvcMiniPlayer.getList();
            if (vm.displayState === 0 && vm.playList.length > 0) {
              vm.displayState = 1;
            }
          });
      }
      function playPauseToggle() {
        if(vm.currentPlay.item.isPlayed) {
          pause();
        } else {
          play();
        }
      }

      function openList(){
        if (vm.displayState === 2) {
          vm.displayState = 3
        } else {
          vm.displayState = 2
        }
      }

      function pause() {
        SvcMiniPlayer.pause();
      }

      function play(id) {
        if(id) {
          SvcMiniPlayer.play(id);
        } else {
          SvcMiniPlayer.play();
        }
      }

      function next() {
        SvcMiniPlayer.next();
      }

      function previous() {
        SvcMiniPlayer.prev();
      }

      function closePlayer() {
        vm.displayState = 0;
        SvcMiniPlayer.removeAll();
      }

      function gotoPost() {
        if (vm.currentPlay === undefined || vm.currentPlay.playlist === null) {
          return;
        }
        $state.go('app.message', {postId: vm.currentPlay.playlist}, {notify : false});
      }

    }
  })();
