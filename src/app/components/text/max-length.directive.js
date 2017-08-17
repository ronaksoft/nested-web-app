(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('maxLength', maxLengthHighlight);

  function maxLengthHighlight() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        function highlight() {
          var maxLength = parseInt(attrs.maxLength);
          return maxLength;
        }
        scope.$watch(function(){
          return element.text().length;
        },function () {
          highlight(element.text());
        });
      }
    };
  }
})();
