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

          initialize();
          var watcher = $scope.$watchGroup(["initialAvatar", "picture"], function (newValues, oldValues) {
            initialize();
          });

          function initialize() {
            if ($scope.picture) {
              $element.initial({
                name: $scope.initialAvatar,
                src: $scope.picture
              });
            } else {
              $element.initial({
                name: $scope.initialAvatar,
                src:'',
              });
            }
          }

          $scope.$on('$destroy', function () {
            watcher();
          });
        }
      };
    });

})();
