(function() {
  'use strict';

  angular
    .module('nested')
    .directive('autoRtl', function($timeout) {
      return {
        scope: { autoRtl: '=' },
        link: function(scope, element) {
          scope.$watch('autoRtl', function(val) {
            console.log(val);
            function isUnicode(str) {
              if (str.substring(0, 1).charCodeAt(0) > 255) {
                return true;
              }
              return false;
            }
            $timeout(function() {
              var elem =  element[0];
              elem.keyup(function(e) {
                // console.log("k");
                if (isUnicode(elem.val())) {
                  angular.element(this).css('direction', 'rtl');
                } else {
                  angular.element(this).css('direction', 'ltr');
                }
              });
            });
          });
        }
      };
    });
})();
