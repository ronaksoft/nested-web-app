(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('maxLength', maxLengthHighlight);

  function maxLengthHighlight(_) {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        var eventReferences = [];
        function highlight() {
          return parseInt(attrs.maxLength);
        }
        eventReferences.push(scope.$watch(function(){
          return element.text().length;
        },function () {
          highlight(element.text());
        }));
        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };
  }
})();
