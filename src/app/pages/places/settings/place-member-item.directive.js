(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('nstPlaceMemberItem', function () {
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
          onSelect: '=',
          disablePromotion: '='
        },
        link: function (scope, element, attrs) {
          scope.mode = attrs.mode;
        }
      };
    });
})();
