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
          if ( scope.inlinePlaces ){
            console.log(1);
            adjustElements();
          }
        },100);

        function adjustElements() {
          startAdjust = true;
          console.log(2);
          if ( elem.height() > 40 && removeItems < 50) {
            console.log(3);
            if ( scope.limitRecipients > 0 ) {
              console.log(3.5);
              scope.limitRecipients--;
            } else {
              console.log(3.8);
              --scope.limitPlaces;
            }
            removeItems++;
            $timeout(function() {
              console.log(4);
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
