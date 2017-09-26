(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebar', Sidebar);

  /** @ngInject */
  function Sidebar() {
    return {
      restrict: 'E',
      templateUrl: function(elem,attrs) {
          return attrs.templateUrl || 'app/components/sidebar/sidebar.html'
      },
      controller: function(elem,attrs) {
        return attrs.controller || 'SidebarController'
      },
      controllerAs: 'ctlSidebar',
      bindToController: {
        collapsed: '='
      }
    };
  }
})();
