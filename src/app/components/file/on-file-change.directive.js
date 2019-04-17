(function() {
  'use strict';

  angular.module('ronak.nested.web.components.file').directive('onFileChange', function() {
    return {
      scope: {
        onFileChange: '='
      },
      link: function($scope, $element) {
        $element.on('change', function(event) {
          $scope.onFileChange(event);
        })
        $scope.$on('$destroy', function() {
          $element.off();
        });
      }
    }
  });
})();
