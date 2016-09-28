(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components')
    .directive('nstSelectable', function ($timeout) {
      return {
        restrict: 'AE',
        scope : {
          selector : "@",
          selectAttr : "@",
          onSelect : "="
        },
        link: function (scope, element, attrs) {
          var seletableElement = $(element);
          //console.log(seletableElement);
          if (!seletableElement){
            return;
          }

          var selectedArray = [];
          
          // Append finder to element
          var selectable = seletableElement.finderSelect({children : scope.selector});

          var countSelected = function () {
            console.log(1234);
            $timeout(function () {
              scope.filesCount = seletableElement.finderSelect('selected').length;
            });
          };
          // var sizeSelected = function () {
          //   console.log(5678);
          //   $timeout(function () {
          //     scope.filesSize = seletableElement.finderSelect('selected');
          //   });
          // };
          selectable.finderSelect('addHook','highlight:after', function(el) {
            el.children(".selected").each(function (i,e) {
              console.log('hey');
              selectedArray.push($(e).attr(scope.selectAttr))
            });
            if (scope.onSelect) {
              countSelected();
              scope.onSelect(selectedArray);
            }

          });

        }
      }
    })

})();

