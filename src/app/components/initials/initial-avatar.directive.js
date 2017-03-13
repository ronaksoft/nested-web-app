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
            initialize(newValues[0], newValues[1]);
          });

          function initialize(name, picture) {
            console.log("name", name);
            console.log("picture", picture);
            
            if (picture && picture.length > 0) {
              $element.initial({
                name: name,
                src: picture
              });
            } else {
              $element.initial({
                name: name
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
