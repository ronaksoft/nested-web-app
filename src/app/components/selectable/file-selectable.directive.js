(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components')
    .directive('nstSelectable', function () {
      return {
        restrict: 'AE',
        scope: {
          selector: "@",
          selectAttr: "@",
          onSelect: "="
        },
        link: function (scope, element, attrs) {
          var seletableElement = $(element);
          if (!seletableElement) {
            return;
          }

          var selectedArray = [];

          seletableElement.selectonic({
            multi: true,
            mouseMode: "standard",
            keyboard: true,
            textSelection: true,
            keyboardMode: "select",
            select: function (event, ui) {
              selectedArray = [];
              seletableElement.selectonic("getSelected").each(function (i, e) {
                selectedArray.push($(e).attr(scope.selectAttr))
              });
              if (scope.onSelect) {
                scope.onSelect(selectedArray);
              }
            },
            unselect: function (event, ui) {
              selectedArray = [];
              seletableElement.selectonic("getSelected").each(function (i, e) {
                selectedArray.push($(e).attr(scope.selectAttr))
              });
              if (scope.onSelect) {
                scope.onSelect(selectedArray);
              }
            }
          });

          $(document).click(function (event) {
            if (seletableElement.selectonic() && seletableElement.selectonic("getSelected").length > 0) {
              if (!(event.target.closest("section.content") || event.target.closest(".content-plus"))) {
                seletableElement.selectonic("unselect");
              }
            }
          })
        }
      }
    })

})();
