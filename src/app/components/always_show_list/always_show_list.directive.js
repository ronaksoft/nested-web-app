(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('alwaysShowList', function() {
      return {
        require: 'uiSelect',
        link: function(scope, element, attrs, $select) {
          scope.$watch(function () {
            return $select.open;
          }, function (val) {
            val || $select.activate();
          });
          $select.activate();
        }
      };
    });
})();
