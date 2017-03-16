(function() {
  'use strict';

  angular.module('ronak.nested.web.place')
    .directive('nstPlaceTeammatesSidebar', nstPlaceTeammatesSidebar);

  function nstPlaceTeammatesSidebar() {
    var directive = {
      restrict: 'AE',
      replace: true,
      templateUrl : 'app/place/partials/teammates/place-teammates-sidebar.html',
      controller : 'placeTeammatesController',
      controllerAs : 'ctlTeammates',
      bindToController : true,
      scope: {
        grandPlace : '=',
      }
    };


    return directive;
  }
})();
