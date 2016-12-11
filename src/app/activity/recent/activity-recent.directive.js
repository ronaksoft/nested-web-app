(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('nstRecentActivity', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/activity/recent/activity-recent.html',
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
