(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.navbar')
      .controller('MiniPlyerController', MiniPlyerController);
  
    /** @ngInject */
    function MiniPlyerController($scope, $rootScope, $uibModal, $state, _, SvcMiniPlayer) {
      var vm = this;
      vm.playPauseToggle = playPauseToggle;
      vm.playList = [];

      vm.currentPlay = {
        track : {},
        index : 0
      }

      getCurrent();

      
      function getCurrent() {
        vm.playList = SvcMiniPlayer.getCurrent()
      }
      
      function getList() {
        vm.playList = SvcMiniPlayer.getCurrent()
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
  
    }
  })();
  