(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('switchDrag', dragxaxis);

  /** @ngInject */
  function dragxaxis($timeout) {
    return {
      restrict: 'A',
      scope: {
        model : '=switchDrag'
      },
      link: function (scope, $element, $attrs) {


        var parent = $element.parent().parent();
        var parentWidth = parent.width();
        var checkbox = $element.parent().parent().find('input');




        $timeout(function () {
          if (!checkbox.prop("disabled")) {
            Draggable.create($element, {
              type:"x",
              bounds:{minX:4, maxX: 52},
              onDrag : function (e) {
                // if dragged towards right
                if (Draggable.get($element).x > 32) {
                  checkbox.prop('checked', true);
                } else {
                  checkbox.prop('checked', false);
                }
              },
              onDragEnd:function() {
                $element.css({transform: ''});
                if (Draggable.get($element).x > 32) {
                  scope.model = true;
                } else {
                  scope.model = false;
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
