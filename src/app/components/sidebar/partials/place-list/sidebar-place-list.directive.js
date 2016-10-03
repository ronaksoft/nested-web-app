(function() {
  'use strict';

  angular.module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarPlaceList', nstSidebarPlaceList);

  function nstSidebarPlaceList() {
    var directive = {
      restrict : 'AE',
      replace : true,
      templateUrl : 'app/components/sidebar/partials/place-list/sidebar-place-list.html',
      controller : 'SidebarPlaceListController',
      controllerAs : 'ctlPlaceList',
      bindToController : true,
      link: link,
      scope: {},
    };

    function link($scope, $element, $attrs) {

    }

    return directive;
  }
})();
