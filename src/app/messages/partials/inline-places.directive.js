(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('inlinePlaces', inlinePlaces);

  /**
   * inline post places for feed page
   */
  function inlinePlaces($timeout) {
    return {
      restrict: 'EA',
      scope:{
        inlinePlaces: '=',
        limitPlaces: '=',
        limitRecipients: '='
      },
      link: function(scope, elem, attrs) {
        var illusion = document.createElement('div');
        var removeItems = 0;
        var startAdjust = false;
        // var allowedWidth = elem.width() - 48 - 96 - 110; // padding - share width - more msg
        $timeout(function() {
          if ( scope.inlinePlaces === true ){
            adjustElements();
          }
        },100);

        function adjustElements() {
          startAdjust = true;
          if ( elem.height() > 40 && removeItems < 50) {
            if ( scope.limitRecipients > 0 ) {
              scope.limitRecipients--;
            } else {
              scope.limitPlaces--;
            }
            removeItems++;
            $timeout(function() {
              adjustElements();
            },10)
          } else {
            startAdjust = false;
          }
        }

        scope.$watch('places',function(n){
          if (n && n.length > 1 && scope.inlinePlaces && !startAdjust ) {
            adjustElements();
          }
        })
      }
    };
  }

})();
