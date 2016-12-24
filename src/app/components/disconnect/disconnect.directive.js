(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('disconnectMessage', function () {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/components/disconnect/disconnect.html',
        controller: 'DisconnectController',
        controllerAs: 'ctrl',
        bindToController : true,
        scope: {
          isDisconnected : '=disconnect'
        }
      };
    });
})();
