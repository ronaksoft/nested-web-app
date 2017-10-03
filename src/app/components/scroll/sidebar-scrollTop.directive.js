(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.components.scroll')
      .directive('sidebarScrollbar', sidebarScrollbar);
  
    /** @ngInject */
    function sidebarScrollbar() {
      return {
        restrict: 'A',
        link: function (scope, $element) {
            scope.scrollTopPlaces = function(){
                $element[0].scrollTop = 0;
            };
        }
      };
    }
  
  })();
  