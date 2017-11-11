(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcRTL', SvcRTL);

  /** @ngInject */
  function SvcRTL() {
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
    return {

      number: new RegExp('^' + numberRange + '+$'),
      letter: new RegExp('^' + charRange + '+$'),
      punctuation: new RegExp('^' + combineRegExps(rtlPunctuations, ltrPunctuations) + '+$'),
      text: new RegExp('^' +
        combineRegExps(numberRange, charRange, rtlPunctuations, ltrPunctuations) + '+$'
      ),
      rtl: new RegExp('^' + combineRegExps(charRange, numberRange, rtlPunctuations) + '+$'),
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
      ltrPunctuationsASCIRange: ltrPunctuations

    };
  }
})();
