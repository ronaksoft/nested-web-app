(function() {
  'use strict';

  angular.module('ronak.nested.web.place')
    .directive('nstPlaceTeamatesSidebar', nstPlaceTeamatesSidebar);

  function nstPlaceTeamatesSidebar() {
    var directive = {
      restrict: 'AE',
      replace: true,
      templateUrl : 'app/place/partials/teamates/place-teamates-sidebar.html',
      controller : 'placeTeamatesController',
      controllerAs : 'ctlTeamates',
      bindToController : true,
      link: link,
      scope: {
        grandPlace : '='
      }
    };

    function link($scope, $element, $attrs) {

    }

    return directive;
  }
})();
