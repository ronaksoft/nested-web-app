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
              if (str.substring(0, 1).charCodeAt() > 255) {
                return true;
              }
              return false;
            }
            $timeout(function() {
              var dir =  element[0];
              dir.keyup(function(e) {
                console.log("k");
                if (isUnicode(dir.val())) {
                  $(this).css('direction', 'rtl');
                }
                else {
                  $(this).css('direction', 'ltr');
                }
              });
            });
          });
        }
      };
    });
})();
