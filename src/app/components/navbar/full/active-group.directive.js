(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('activeGroup', function($state) {
      return {
        restrict: 'A',
        scope :{
          activeGroup : "@"
        },
        link: function(scope, element, attrs) {
          if (!$state.current.options) {
            return;
          }

          if ($state.current.options.group === scope.activeGroup) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        }
      }
    });
})();
