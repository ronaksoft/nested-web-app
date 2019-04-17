(function() {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .directive('myApplications', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/apps/my-apps/my-apps.html',
        controller : 'FavoriteAppsController',
        controllerAs : 'appsCtrl',
        bindToController : true,
        replace : true,
      };
    });
})();
