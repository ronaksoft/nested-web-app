(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('autoFill', [function(){
      return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          scope.$watch(function () {
            return element.val();
          }, function(nv, ov) {
            if(nv !== ov)
              ngModel.$setViewValue(nv)
          })
        }
      };
    }])
})();
