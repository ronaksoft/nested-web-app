(function() {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.navbar')
      .directive('miniPlayer', miniPlayer);
  
    /** @ngInject */
    function miniPlayer() {
      return {
        restrict: 'E',
        templateUrl: 'app/components/mini-player/mini-player.html',
        controller: 'MiniPlyerController',
        controllerAs: 'ctrl',
        bindToController: true
      };
    }
  })();
  