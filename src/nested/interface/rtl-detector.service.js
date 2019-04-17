(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcRTL', SvcRTL);

  /** @ngInject */
  function SvcRTL($rootScope) {
    var numberRange = '[\u06F0-\u06F9]',
      charRange = ['[\\s,\u06A9\u06AF\u06C0\u06CC\u060C',
        '\u062A\u062B\u062C\u062D\u062E\u062F',
        '\u063A\u064A\u064B\u064C\u064D\u064E',
        '\u064F\u067E\u0670\u0686\u0698\u200C',
        '\u0621-\u0629\u0630-\u0639\u0641-\u0654]'
      ].join(),
      rtlPunctuations = '(،|؟|«|»|؛|٬)',
      ltrPunctuations = '(\\.|\\!|\\-|\\[|\\]|\\(|\\)|/)';


    function combineRegExps() {
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
    function clearString(str) {
      if (!str || !_.isString(str) || str.length == 0 || str == "undefined") {
        return '';
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
      return str;
    }
    function checkRtl(str) {
      if (str.length == 0 || str == "undefined") {
        return $rootScope._direction === 'rtl'
      }
      return new RegExp('^' + combineRegExps(charRange, numberRange, rtlPunctuations) + '+$').test(str)
    }
    checkRtl.prototype.test = checkRtl;
    return {

      number: new RegExp('^' + numberRange + '+$'),
      letter: new RegExp('^' + charRange + '+$'),
      punctuation: new RegExp('^' + combineRegExps(rtlPunctuations, ltrPunctuations) + '+$'),
      text: new RegExp('^' +
        combineRegExps(numberRange, charRange, rtlPunctuations, ltrPunctuations) + '+$'
      ),
      rtl: checkRtl,
      hasNumber: new RegExp(numberRange),
      hasLetter: new RegExp(charRange),
      hasPunctuation: new RegExp(combineRegExps(rtlPunctuations, ltrPunctuations)),
      hasText: new RegExp(
        combineRegExps(numberRange, charRange, rtlPunctuations, ltrPunctuations)
      ),
      hasRtl: new RegExp(combineRegExps(numberRange, charRange, rtlPunctuations)),

      numbersASCIRange: numberRange,
      lettersASCIRange: charRange,
      rtlPunctuationsASCIRange: rtlPunctuations,
      ltrPunctuationsASCIRange: ltrPunctuations,
      clear: clearString

    };
  }
})();
