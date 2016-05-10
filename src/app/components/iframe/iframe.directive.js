(function() {
  'use strict';

  angular
    .module('nested')
    .directive('iframe', function () {
      return {
        scope: {
          ngBind: '=',
          ngBindHtml: '='
        },
        link: function (scope, element) {
          var doc = element.contentWindow.document;
          doc.open();
          doc.write(scope.ngBindHtml || scope.ngBind);
          doc.close();
        }
      };
    });

})();
