(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('addScopeScrollTop', sidebarScrollbar);
  
    /** @ngInject */
    function sidebarScrollbar() {
      return {
        restrict: 'A',
        link: function (scope, $element) {
            scope.scrollToTop = function(){
                $element[0].scrollTop = 0;
            };
        }
      };
    }
  
  })();
  