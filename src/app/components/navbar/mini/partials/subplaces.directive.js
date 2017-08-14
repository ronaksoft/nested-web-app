(function() {
  'use strict';

  angular.module('ronak.nested.web.components.navbar')
    .directive('nstNavbarPlaceInfo', nstNavbarPlaceInfo);

  function nstNavbarPlaceInfo() {
    var directive = {
      restrict: 'AE',
      replace: true,
      templateUrl : 'app/components/navbar/mini/partials/sub-place.html',
      controller : 'SidebarPlaceInfoController',
      controllerAs : 'NavbarSubCtrl',
      bindToController : true,
      link: link,
      scope: {
        grandPlace : '=',
        isOpen : '='
      }
    };

    function link($scope) {
    }

    return directive;
  }
})();
