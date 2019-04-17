(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('playerEventHandler', playerEventHandler);

  function playerEventHandler(SvcMiniPlayer) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element[0].onplay = function() {
          SvcMiniPlayer.pause();
        };
      }
    };
  }
})();
