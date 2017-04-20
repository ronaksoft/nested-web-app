(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('ellipsisMail', ellipsisMail);

  function ellipsisMail($timeout) {
    return {
      restrict: 'A',
      link: function (scope ,$element, attrs) {

        function resizer() {

          var maxChars = 36;
          var str = $element.text();
          var $numWords = str.length || 0;
          var atSignIndex = str.indexOf("@");
          var domainLength = $numWords - atSignIndex;


          if ($numWords > maxChars ) {
            scope.$parent.forceTooltip = true;

            if(domainLength < 28 && atSignIndex > -1){
              str = str.substr(0, maxChars - domainLength - 7) + '...' + str.substr(atSignIndex - 4, str.length);
            } else if(domainLength > 27 && atSignIndex > -1) {
              str = str.substr(0, (maxChars / 2) - 4) + '...' + str.substr(atSignIndex - 4, maxChars / 4) + '...' + str.substr($numWords - (maxChars / 4), $numWords);
            } else {
              str = str.substr(0, maxChars - 10) + '...' + str.substr(maxChars - 7, $numWords);

            }

            $element.text(str);
          }
        }

        scope.$watch(function () {

          return $element.text().length
        },function () {
          resizer()
        })



      }
    };
  }
})();
