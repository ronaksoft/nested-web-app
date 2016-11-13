(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('switchDrag', dragxaxis);

  /** @ngInject */
  function dragxaxis() {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {

        var parent = $element.parent().parent();
        var parentWidth = parent.width();
        var checkbox = $element.parent().parent().find('input');


        Draggable.create($element, {
          type:"x",
          bounds:parent[0],
          minX: 4,
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
          }
        });



      }
    }
  }

})();
