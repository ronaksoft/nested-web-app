(function() {
  'use strict';

  angular
    .module('nested')
    .directive('placeMemberItem', function (moment) {
      return {
        restrict: 'E',
        templateUrl : 'app/pages/places/settings/place-member-item.html',
        scope: {
          hasControlAccess : '=',
          hasRemoveAccess : '=',
          member : '=',
          role : '@'
        },
        link: function (scope, element, attrs) {
          
        }
      };
    });
})();
