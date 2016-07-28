(function() {
  'use strict';

  angular
    .module('nested')
    .directive('nstAttachmentsPreviewBar', function () {
      return {
        restrict: 'E',
        templateUrl: 'app/components/attachments/attachments-preview-bar.html',
        scope : {
          onItemClick : '&',
          items : '=',
          mode : '='
        },
        link : function (scope, element, attributes) {
          scope.internalMode = 'badge';
          if (attributes.mode === 'badge' || attributes.mode === 'thumbnail') {
            scope.internalMode = attributes.mode;
          }
        }
      };
    });

})();
