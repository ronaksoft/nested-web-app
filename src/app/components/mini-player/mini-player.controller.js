(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.navbar')
      .controller('MiniPlyerController', MiniPlyerController);
  
    /** @ngInject */
    function MiniPlyerController($scope, $rootScope, $uibModal, $state, _, SvcMiniPlayer) {
      var vm = this;
      vm.playList = [];

      vm.currentPlay = {
        item : {},
        index : 0
      }

      getCurrent();
      function getCurrent() {
        vm.playList = SvcMiniPlayer.getCurrent()
      }
  
    }
  })();
  