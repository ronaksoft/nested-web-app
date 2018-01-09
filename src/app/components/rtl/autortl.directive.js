/* eslint-disable */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('autoDir', autoDirDetector);

  function autoDirDetector($parse, $rootScope, _, SvcRTL) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        //persianRex Lib written by imanmh

        function direction(str) {
          var content = SvcRTL.clear(str);
          if (SvcRTL.rtl(content)) {
            initRtl();
          } else {
            initLtr()
          }
          return;
        }

        function initRtl() {
          return element.addClass('RTL-text').css("direction", "rtl");
        }

        function initLtr() {
          return element.addClass('LTR-text').css("direction", "ltr");
        }

        var listener = scope.$watch(function () {
          return $parse(attrs.autoDir)(scope);
        }, function (newVal) {
          var dom = new DOMParser;
          var parse = dom.parseFromString(newVal, 'text/html');
          direction(parse.body.textContent);
        });
        scope.$on('$destroy', function () {
          listener();
        });
      }
    };
  }
})();
