(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('recentVisitedPlaces', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/place/recent-visited/recently-visited.html',
        controller : 'RecentVisitedController',
        controllerAs : 'ctrl',
        bindToController : true,
        replace : true,
        link: function (scope) {

        }
      };
    });
})();
