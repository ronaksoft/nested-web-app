(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('previewOnLoad', function($timeout) {
      return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
          $element.hide();
          var jelement = $($element);
          var jthumb = $attrs.thumbnailId ? $($attrs.thumbnailId) : null;
          jelement.on("load", function(event, foo) {
            jelement.fadeIn();
            if (jthumb) {
              jthumb.hide();
            }
          });
        }
      }
    });
})();
