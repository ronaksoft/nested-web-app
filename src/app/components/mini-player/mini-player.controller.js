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
      vm.playList = [];
      vm.isVoice = false;

      vm.currentPlay = {
        item : {},
        index : 0
      }

      getCurrent();

      SvcMiniPlayer.timeChanged(function (d) {
        console.log(d);
      });

      SvcMiniPlayer.statusChanged(function (result) {
        if (result.status === 'play') {
          getCurrent();
        }
      });

      SvcMiniPlayer.listUpdated(function () {
        getCurrent();
        getList()
      });


      function getCurrent() {
        vm.currentPlay = SvcMiniPlayer.getCurrent();
        console.log(vm.currentPlay);
        if (vm.currentPlay.item) {
          vm.isVoice = vm.currentPlay.item.uploadType !== "AUDIO";
        }
      }

      function getList() {
        vm.playList = SvcMiniPlayer.getList();
        console.log(vm.playList);
        if ( vm.displayState === 0 && vm.playList.length > 0) {
          vm.displayState = 1;
        }
      }
      function playPauseToggle() {
        if(vm.currentPlay.track.isPlayed) {
          pause();
        } else {
          play();
        }
      }

      function pause() {
        vm.playList = SvcMiniPlayer.pause(vm.currentPlay.track.id);
      }

      function play() {
        vm.playList = SvcMiniPlayer.play(vm.currentPlay.track.id);
      }

      function next() {
        vm.playList = SvcMiniPlayer.play(vm.playList[vm.currentPlay.index + 1].id);
      }

      function previous() {
        vm.playList = SvcMiniPlayer.play(vm.playList[vm.currentPlay.index - 1].id);
      }

      function closePlayer(){
        vm.displayState = 0;
      }

    }
  })();
