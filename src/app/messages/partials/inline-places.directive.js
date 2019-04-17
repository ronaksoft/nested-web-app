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
      link: function(scope, elem) {
        var removeItems = 0;
        $timeout(function() {
          if ( scope.inlinePlaces ){
            adjustElements();
          }
        },100);

        function adjustElements() {
          if ( elem.height() > 40 && removeItems < 50) {
            if ( scope.limitRecipients > 0 ) {
              scope.limitRecipients--;
            } else {
              --scope.limitPlaces;
            }
            removeItems++;
            $timeout(function() {
              adjustElements();
            },100);
          }
        }
      }
    };
  }

})();
