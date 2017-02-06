(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('searchPlaceholderSetter', searchPlaceholderSetter);

  /** @ngInject */
  function searchPlaceholderSetter(NstUtility, NstSvcTranslation) {
    return {
      restrict: 'A',
      scope : {
        placeName : '=',
        hasPlace : '='
      },
      link : function (scope, element, attributes) {
        var jelement = $(element);
        var bluredText = NstSvcTranslation.get("Search");

        jelement.attr('placeholder', bluredText);

        var focusedText = null;

        var canceler = scope.$watch('hasPlace', function (newValue, oldValue) {
          if (scope.hasPlace) {
            focusedText = NstUtility.string.format(NstSvcTranslation.get("Search in {0}"), scope.placeName);
          } else {
            focusedText = NstSvcTranslation.get("Search Places, users and messages...");
          }
        });

        var setOnFocus = function (event) {
          jelement.attr('placeholder', focusedText);
        };

        var setOnBlur = function (event) {
          jelement.attr('placeholder', bluredText);
        };

        jelement.on('focus', setOnFocus);
        jelement.on('blur', setOnBlur);

        scope.$on('$destroy', function () {
          if (setOnFocus) {
            jelement.off('focus', setOnFocus);
          }

          if (setOnBlur) {
            jelement.off('blur', setOnBlur);
          }

          canceler();
        });
      }
    };
  }
})();
