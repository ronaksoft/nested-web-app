(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.navbar')
      .controller('MiniPlyerController', MiniPlyerController);

    /** @ngInject */
    function MiniPlyerController($scope, $rootScope, $uibModal, $state, _, SvcMiniPlayer) {
      var vm = this;
      vm.displayState = 0;
      vm.playPauseToggle = playPauseToggle;
      vm.closePlayer = closePlayer;
      vm.next = next;
      vm.previous = previous;
      vm.play = play;
      vm.pause = pause;
      vm.playStatus = false;
      vm.playList = [];
      vm.isVoice = false;

      var updateDebounce = _.debounce(update, 128);

      vm.currentPlay = {
        item : {},
        index : 0
      }


      SvcMiniPlayer.timeChanged(function (d) {
        // console.log(d);
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
            // console.log(vm.playList);
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

      function pause() {
        SvcMiniPlayer.pause();
      }

      function play() {
        SvcMiniPlayer.play();
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
