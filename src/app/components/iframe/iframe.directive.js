(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('iframeInject', function () {
      return {
        scope: {
          ngBind: '=',
          ngBindHtml: '='
        },
        link: function (scope, element, attrs) {
          if (!attrs.src) {
            var doc = element.contentWindow.document;
            doc.open();
            doc.write(scope.ngBindHtml || scope.ngBind);
            doc.close();
          }
        }
      };
    });

})();
