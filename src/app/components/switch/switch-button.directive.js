(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('switchDrag', dragxaxis);

  /** @ngInject */
  function dragxaxis($timeout,$rootScope, Draggable) {
    return {
      restrict: 'A',
      scope: {
        model : '=switchDrag',
        size : '=?'
      },
      link: function (scope, $element) {

        var width = scope.size === 'sm' ? 30 : 45
        var mid = scope.size === 'sm' ? 16 : 24
        var offSet = scope.size === 'sm' ? 2 : 3

        var checkbox = $element.parent().parent().find('input');

        var isRTL = $rootScope._direction == 'rtl';

        var minX = isRTL ? -1 * width : offSet;
        var maxX = isRTL ? -1 * offSet : width;
        var midX = isRTL ? -1 * mid : mid;
        $timeout(function () {
          if (!checkbox.prop("disabled")) {
            Draggable.create($element, {
              type:"x",
              bounds:{minX:minX, maxX: maxX},
              throwProps:true,
              onDrag : function () {

                // if dragged towards right
                if (isRTL) {
                  if ( Draggable.get($element).x < midX ) {
                    checkbox.prop('checked', true);
                  } else {
                    checkbox.prop('checked', false);
                  }
                } else {
                  if ( Draggable.get($element).x > midX ) {
                    checkbox.prop('checked', true);
                  } else {
                    checkbox.prop('checked', false);
                  }
                }

              },
              onRelease:function() {
                if(isRTL) {
                    if (Draggable.get($element).x > midX) {
                      scope.model = false;
                    } else {
                      scope.model = true;
                    }
                  } else {
                    if (Draggable.get($element).x < midX) {
                      scope.model = false;
                    } else {
                      scope.model = true;
                    }
                  }
                  $element.css({transform: ''});
              }
            });
            $element.css({transform: ''});
          }
        },1000);

      }
    };
  }

})();
