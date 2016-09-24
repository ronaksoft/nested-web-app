(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstQuickMessage', QuickMessage);

  /** @ngInject */
  function QuickMessage() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/messages/partials/quick-message/main.html',
      controller: 'QuickMessageController',
      controllerAs: 'ctlQuickMessage',
      bindToController: {
        placeId: '='
      }
    };
  }

})();
