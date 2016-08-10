(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstPlaceMemberItem', function (moment) {
      return {
        restrict: 'E',
        templateUrl : 'app/pages/places/settings/place-member-item.html',
        controller : 'PlaceMemberItemController',
        controllerAs : 'memberCtrl',
        bindToController : true,
        scope: {
          place : '=',
          hasControlAccess : '=',
          hasRemoveAccess : '=',
          member : '=',
          role : '='
        },
        link: function (scope, element, attrs) {

        }
      };
    });
})();
