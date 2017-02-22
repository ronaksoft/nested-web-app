(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('initialAvatar', function () {
      return {
        scope: {
          initialAvatar : '@',
          picture : '@'
        },
        link: function ($scope, $element) {
          if ($scope.picture) {
            $element.initial({
              name: $scope.initialAvatar,
              src: $scope.picture
            });
          } else {
            $element.initial({
              name: $scope.initialAvatar,
            });
          }
        }
      };
    });

})();
