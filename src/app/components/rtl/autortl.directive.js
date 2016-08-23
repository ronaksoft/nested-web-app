(function() {
  'use strict';

  angular
    .module('nested')
    .directive('autoDir', autoDirDetector);

  function autoDirDetector() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        var str = attrs.autoDir;
        console.log(str);
        if (!str || !_.isString(str)) {
          return element.attr("dir","ltr");
        }

        str = str.trim();
        var charCode = str.charCodeAt(0);
        if (charCode > 1300 && 1700 > charCode) {
          return element.attr("dir","rtl");
        }
      }
    };
  }
})();
