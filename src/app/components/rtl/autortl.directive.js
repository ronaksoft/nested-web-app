(function() {
  'use strict';

  angular
    .module('nested')
    .directive('autoDir', autoDirDetector);

  function autoDirDetector() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {

        function direction(str) {
          if (!str || !_.isString(str)) {
            return element.attr("dir","ltr");
          }

          str = str.trim();
          // if (persianRex.rtl.test(str)) {
          //   console.log("farsi");
          //   return element.attr("dir","rtl");
          // }
          var charCode = str.charCodeAt(0);
          if (charCode > 1300 && 1700 > charCode) {
            return element.attr("dir","rtl");
          }
        }

        scope.$watch(function(){
          return attrs.autoDir;
        },function () {
          direction(attrs.autoDir);
        })


      }
    };
  }
})();
