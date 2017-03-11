(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('nstPlaceMemberItem', function (moment) {
      return {
        restrict: 'EA',
        templateUrl: 'app/pages/places/settings/place-member-item.html',
        controller: 'PlaceMemberItemController',
        controllerAs: 'memberCtrl',
        bindToController: true,
        scope: {
          place: '=',
          hasControlAccess: '=',
          hasRemoveAccess: '=',
          member: '=',
          role: '=',
          onSelect: '='
        },
        link: function (scope, element, attrs) {
          scope.mode = attrs.mode;
        }
      };
    });
})();
