(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstRecentActivity', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/events/partials/recent/activity-recent.html',
        controller : 'RecentActivityController',
        controllerAs : 'recentCtrl',
        bindToController : true,
        replace : true,
        scope: {
          count : '@',
          place : '=',
          placeId : '='
        },
        link: function (scope, element, attrs) {

        }
      };
    });
})();
