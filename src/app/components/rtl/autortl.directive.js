(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .directive('autoDir', autoDirDetector);

  function autoDirDetector() {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {

        //persianRex Lib written by imanmh
        var persianRex = {};

        var numberRange = '[\u06F0-\u06F9]',
          charRange = ['[\\s,\u06A9\u06AF\u06C0\u06CC\u060C',
            '\u062A\u062B\u062C\u062D\u062E\u062F',
            '\u063A\u064A\u064B\u064C\u064D\u064E',
            '\u064F\u067E\u0670\u0686\u0698\u200C',
            '\u0621-\u0629\u0630-\u0639\u0641-\u0654]'].join(),
          rtlPunctuations = '(،|؟|«|»|؛|٬)',
          ltrPunctuations = '(\\.|:|\\!|\\-|\\[|\\]|\\(|\\)|/)';

        persianRex.number = new RegExp('^' + numberRange + '+$');
        persianRex.letter = new RegExp('^' + charRange + '+$');
        persianRex.punctuation = new RegExp('^' + combineRegExps(rtlPunctuations, ltrPunctuations) + '+$');
        persianRex.text = new RegExp('^' +
          combineRegExps(numberRange, charRange, rtlPunctuations, ltrPunctuations) + '+$'
        );
        persianRex.rtl = new RegExp('^' + combineRegExps(charRange, numberRange, rtlPunctuations) + '+$');

        persianRex.hasNumber = new RegExp(numberRange);
        persianRex.hasLetter = new RegExp(charRange);
        persianRex.hasPunctuation = new RegExp(combineRegExps(rtlPunctuations, ltrPunctuations));
        persianRex.hasText = new RegExp(
          combineRegExps(numberRange, charRange, rtlPunctuations, ltrPunctuations)
        );
        persianRex.hasRtl = new RegExp(combineRegExps(numberRange, charRange, rtlPunctuations));

        persianRex.numbersASCIRange = numberRange;
        persianRex.lettersASCIRange = charRange;
        persianRex.rtlPunctuationsASCIRange = rtlPunctuations;
        persianRex.ltrPunctuationsASCIRange = ltrPunctuations;

        function combineRegExps () {
          var combined = '(';
          for (var i = 0; i < arguments.length; i++) {
            combined += '(';
            if (i != arguments.length - 1)
              combined += arguments[i] + ')|';
            else
              combined += arguments[i] + ')';
          }
          return combined + ')';
        }

        //AMD wrapper
        if (typeof define !== 'undefined' ) {
          define([], persianRex);
          //NodeJS wrapper
        } else if (typeof exports !== 'undefined') {

          exports.number = persianRex.number;
          exports.letter = persianRex.letter;
          exports.punctuation = persianRex.punctuation;
          exports.text = persianRex.text;
          exports.hasNumber = persianRex.hasNumber;
          exports.hasLetter = persianRex.hasLetter;
          exports.hasPunctuation = persianRex.hasPunctuation;
          exports.hasText = persianRex.hasText;
          exports.lettersASCIRange = charRange;
          exports.numbersASCIRange = numberRange;
          exports.rtlPunctuationsASCIRange = rtlPunctuations;
          exports.ltrPunctuationsASCIRange = ltrPunctuations;
          exports.rtl = persianRex.rtl;
          exports.hasRtl = persianRex.hasRtl;
        } else {
          this.persianRex = persianRex;
        }
        function direction(str) {
          if (!str || !_.isString(str)) {
            return element.attr("dir","ltr");
          }

          function findFw(str) {
            str = str.replace(/Fwd: /i, "");
            if (str.search("Fwd:") > -1) {
              return findFw(str)
            }
            if (str.search("Re:") > -1){
              return findRe(str)
            }
            decideRtl(str)
          }

          function findRe(str) {
            str = str.replace(/Re: /i, "");
            if (str.search("Re:") > -1) {
              return findRe(str);
            }
            decideRtl(str)
          }
          if (str.search("Fwd:") > -1){
            findFw(str);
          }else if(str.search("Re:") > -1) {
            findRe(str);
          }else {
            decideRtl(str);
          }

          function decideRtl(str) {
            var emojiRanges = [
              '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
              '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
              '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
            ];
            str = str.replace(new RegExp(emojiRanges.join('|'), 'g'), '');
            str = str.trim();
            str = str.substring(0, 1);
            if (persianRex.rtl.test(str)) {
              return element.attr("dir","rtl");
            }
          }

          // var charCode = str.charCodeAt(0);
          // if (charCode > 1300 && 1700 > charCode) {
          //   return element.attr("dir","rtl");
          // }
        }

        scope.$watch(function(){
          return attrs.autoDir;
        },function () {
          direction(attrs.autoDir);
        });


      }
    };
  }
})();
