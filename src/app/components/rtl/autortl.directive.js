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
          if (!str || !_.isString(str)) {
            return
          }
          if (str.length == 0 || str == "undefined") {
            if ($rootScope._direction == 'rtl') {
              return initRtl()
            } else {
              return initLtr()
            }
          }
          var emojiRanges = [
            '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
            '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
            '\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
          ];
          str = str.replace(new RegExp(emojiRanges.join('|'), 'g'), '');
          //detect mentions :
          str = str.replace(/(^|\s)@(\w+)/g, '');
          str = str.trim();
          str = str.substring(0, 1);
          if (SvcRTL.rtl.test(str)) {
            return initRtl()
          } else {
            return initLtr()
          }
        }

        function initRtl() {
          element.addClass('RTL-text');
          return element.css("direction", "rtl");
        }

        function initLtr() {
          element.addClass('LTR-text');
          return element.css("direction", "ltr");
        }

        scope.$watch(function () {
          return $parse(attrs.autoDir)(scope);
        }, function (newVal) {
          var dom = new DOMParser;
          var parse = dom.parseFromString(newVal, 'text/html');
          direction(parse.body.textContent);
        });

      }
    };
  }
})();
