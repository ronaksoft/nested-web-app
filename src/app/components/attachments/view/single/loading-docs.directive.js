(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('loadingDocs', loadingDocs);

  function loadingDocs() {
    return {
      restrict: 'A',
      scope: {
        show : '='
      },
      link: function (scope,el) {
        el.width(angular.element('.nst-preview-pic-mode').width() - 20);
        el.height(angular.element('.nst-preview-pic-mode').height() - 20);

        el.load(function() {
          console.log('aaa');
          scope.show = true
        })
      }
    };

  }
})();
