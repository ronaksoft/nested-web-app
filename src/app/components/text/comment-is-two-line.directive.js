(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('isTwoLine', isTwoLine);

  function isTwoLine($timeout, $rootScope) {
    return {
      restrict: 'A',
      link: function (scope ,$element, attrs) {

        function resizer() {
          if ($element.height() > 17) {
            $element.width('100%');
            $element.css({'justify-content' : 'flex-start'});
          }
        }

        $timeout(resizer,0);



      }
    };
  }
})();
