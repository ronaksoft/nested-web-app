(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('contentedit', function () {
       var obj = {
        restrict: 'A',
        replace: false,
        scope: false,
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel, Medium) {
          new Medium({
            element: angular.element(element)[0],
            autofocus: false,
            autoHR: true,
            mode: Medium.richMode,
            maxLength: -1,
            tags: null,
            pasteAsText: true,
            beforeInvokeElement: function () {
            },
            beforeAddTag: function () {
            },
            keyContext: null
          });
          return;
        }
      }
    })
})();
