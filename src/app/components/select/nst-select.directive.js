(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components')
    .directive('nstSelectable', function () {
      return {
        restrict: 'AE',
        scope : {
          selector : "@",
          selectAttr : "@",
          onSelect : "="
        },
        link: function (scope, element, attrs) {
          var seletableElement = $(element);
          if (!seletableElement){
            return;
          }

          var selectedArray = [];


          // Append finder to element
          var selectable = seletableElement.finderSelect({children : scope.selector});


          //
          selectable.finderSelect('addHook','highlight:after', function(el) {
            selectedArray = [];
            seletableElement.children(".selected").each(function (i,e) {
              selectedArray.push($(e).attr(scope.selectAttr))
            });

            if (scope.onSelect)
              scope.onSelect(selectedArray);

          })

        }
      }
    })

})();

