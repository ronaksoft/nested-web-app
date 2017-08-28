(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstTopbar', nstTopbar);

  /** @ngInject */
  function nstTopbar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/topbar/nst-topbar.html',
      controller: 'TopBarController',
      controllerAs: 'ctrlTopBar',
      bindToController: {
        collapsed: '='
      }
    };
  }
})();
