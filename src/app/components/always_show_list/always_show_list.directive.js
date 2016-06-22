(function() {
  'use strict';

  angular
    .module('nested')
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
