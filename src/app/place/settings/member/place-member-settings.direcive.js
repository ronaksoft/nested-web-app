(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('placeMemberSettings', function () {
      return {
        restrict: 'AE',
        replace: true,
        controller: 'PlaceMemberSettingsController',
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
          place: '=',
          access: '=?',
          viewMode: '=?'
        },
        templateUrl: function(elem, attrs) {
            return attrs.viewMode === 'content-plus'
            ? 'app/place/partials/teammates/place-teammates-sidebar.html'
            : 'app/place/settings/member/place-member-settings.html';
        }
      };
    });

})();
