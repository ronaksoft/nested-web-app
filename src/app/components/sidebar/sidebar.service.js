(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .service('NstSvcSidebar', NstSvcSidebar);

  /** @ngInject */
  function NstSvcSidebar() {
    function Sidebar() {
      this.onItemClick = null;

    }

    Sidebar.prototype = {};
    Sidebar.prototype.constructor = Sidebar;

    Sidebar.prototype.setOnItemClick = function (onItemClick) {
      this.onItemClick = onItemClick;
    };

    Sidebar.prototype.removeOnItemClick = function () {
      this.onItemClick = null;
    };

    return new Sidebar();
  }
})();
