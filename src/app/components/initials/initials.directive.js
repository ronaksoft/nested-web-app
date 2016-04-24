(function() {
  'use strict';

  angular
    .module('nested')
    .directive('initialsNavbar', function nestedNavbar() {
      return {
        restrict: 'A'
      };
    });

})();
