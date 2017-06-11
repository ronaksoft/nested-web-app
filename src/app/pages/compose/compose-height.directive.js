(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('composeHeight', function ($timeout, _, NstSvcKeyFactory,NST_KEY) {
      return {
        restrict: 'A',
        link: function (scope, element , attrs) {
            console.log(element.parent().height());
            var h = element.parent().height();
            console.log(scope.ctlCompose);
            // scope.ctlCompose.froalaOpts.height = h - 34;
            // $(selector).data('froala.editor').size.refresh();
            
        }
      };
    });
})();
