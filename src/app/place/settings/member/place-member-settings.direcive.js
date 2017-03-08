(function () {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('placeMemberSettings', function () {
      return {
        templateUrl: 'app/place/settings/member/place-member-settings.html',
        controller: 'PlaceMemberSettingsController',
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
          place: '=',
          access: '='
        },
        link: function (scope, element, attrs) {
        }
      };
    });

})();
