(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('fitText', fitText);

  function fitText($timeout) {
    return {
      restrict: 'A',
      link: function (scope ,$element, attrs) {

        function resizer() {
          var $quote = $element;

          var $numWords = $quote.text().length || 0;

          if (($numWords >= 1) && ($numWords < 40)) {
            $quote.css("font-size", "24px");
          }
          else if (($numWords >= 40) && ($numWords < 68)) {
            $quote.css("font-size", "18px");
          }
          else {
            $quote.css("font-size", "14px");
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
