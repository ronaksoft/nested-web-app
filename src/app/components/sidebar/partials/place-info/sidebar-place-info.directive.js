(function() {
  'use strict';

  angular.module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarPlaceInfo', nstSidebarPlaceInfo);

  function nstSidebarPlaceInfo() {
    var directive = {
      restrict: 'AE',
      replace: true,
      templateUrl : 'app/components/sidebar/partials/place-info/sidebar-place-info.html',
      controller : 'SidebarPlaceInfoController',
      controllerAs : 'ctlPlaceInfo',
      bindToController : true,
      link: link,
      scope: {
        grandPlace : '=',
        unreadMode : '='
      }
    };

    function link($scope, $element, $attrs) {

    }

    return directive;
  }
})();
