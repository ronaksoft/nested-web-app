(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.navbar')
      .controller('MiniPlyerController', MiniPlyerController);

    /** @ngInject */
    function MiniPlyerController($scope, $rootScope, $uibModal, $state, _, SvcMiniPlayer, moment) {
      var vm = this;
      vm.displayState = 0;
      vm.playPauseToggle = playPauseToggle;
      vm.closePlayer = closePlayer;
      vm.next = next;
      vm.previous = previous;
      vm.play = play;
      vm.pause = pause;
      vm.openList = openList;
      vm.playStatus = false;
      vm.playList = [];
      vm.isVoice = false;
      vm.currentTime = 0;
      vm.currentTimeString = ' 00:00'
      vm.currentRatio = 0;

      var updateDebounce = _.debounce(update, 128);

      vm.currentPlay = {
        item : {},
        index : 0
      }


      SvcMiniPlayer.timeChanged(function (t) {
        $scope.$apply(function () {
          vm.currentTime = Math.floor(t);
        });
      });

      SvcMiniPlayer.statusChanged(function (result) {
        vm.playStatus = result.status === 'play';
        if (result.status === 'play') {
          updateDebounce();
        }
      });

      SvcMiniPlayer.listUpdated(function () {
        updateDebounce();
      });

      function update() {
        getCurrent();
        getList()
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
            console.log( vm.playList);
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

      function closePlayer(){
        vm.displayState = 0;
        SvcMiniPlayer.removeAll();
      }

    }
  })();
