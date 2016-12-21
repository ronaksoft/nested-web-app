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
      controllerAs : 'place',
      bindToController : true,
      link: link,
      scope: {
        grandPlace : '=',
        isOpen : '='
      }
    };

    function link($scope, $element, $attrs) {
    }

    return directive;
  }
})();
