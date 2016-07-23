(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nestedSidebar', nestedSidebar);

  /** @ngInject */
  function nestedSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'ctlSidebar',
      bindToController: true
    };
  }
})();
