(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstQuickCompose', QuickMessage);

  /** @ngInject */
  function QuickMessage() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/compose/main.html',
      controller: 'ComposeController',
      controllerAs: 'ctlCompose',
      bindToController: {
        placeId: '=',
        mode: '='
      }
    };
  }

})();
