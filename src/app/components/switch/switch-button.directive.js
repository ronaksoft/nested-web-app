(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('switchDrag', dragxaxis);

  /** @ngInject */
  function dragxaxis($timeout,$rootScope) {
    return {
      restrict: 'A',
      scope: {
        model : '=switchDrag'
      },
      link: function (scope, $element, $attrs) {


        var parent = $element.parent().parent();
        var parentWidth = parent.width();
        var checkbox = $element.parent().parent().find('input');

        var isRTL = $rootScope._direction == 'rtl';

        var minX = isRTL ? -52 : 4;
        var maxX = isRTL ? -4 : 52;
        var midX = isRTL ? -32 : 32;





        $timeout(function () {
          if (!checkbox.prop("disabled")) {
            Draggable.create($element, {
              type:"x",
              bounds:{minX:minX, maxX: maxX},
              onDrag : function (e) {
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
              onDragEnd:function() {
                $element.css({transform: ''});
                if (typeof scope.model === 'function'){
                  if(isRTL) {
                    if (Draggable.get($element).x > midX) {
                      scope.model(true);
                    } else {
                      scope.model(false);
                    }
                  } else {
                    if (Draggable.get($element).x < midX) {
                      scope.model(true);
                    } else {
                      scope.model(false);
                    }
                  }

                }else{
                  if(isRTL) {
                    if (Draggable.get($element).x > midX) {
                      scope.model = true;
                    } else {
                      scope.model = false;
                    }
                  } else {
                    if (Draggable.get($element).x < midX) {
                      scope.model = true;
                    } else {
                      scope.model = false;
                    }
                  }
                }
              }
            });
            $element.css({transform: ''});
          }

        },2000);


      }
    }
  }

})();
