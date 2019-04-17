(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstQuickMessage', QuickMessage);

  /** @ngInject */
  function QuickMessage() {
    return {
      restrict: 'E',
      templateUrl: 'app/messages/partials/quick-message/main.html',
      controller: 'QuickMessageController',
      controllerAs: 'ctlQuickMessage',
      bindToController: {
        placeId: '='
      }
    };
  }

})();
