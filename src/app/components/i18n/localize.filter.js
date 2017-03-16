(function() {
  angular
    .module('ronak.nested.web.components.i18n')
    .filter('localize', ['NstSvcTranslation', function(NstSvcTranslation) {

      var numbers = {
        '1': NstSvcTranslation.get("1"),
        '2': NstSvcTranslation.get("2"),
        '3': NstSvcTranslation.get("3"),
        '4': NstSvcTranslation.get("4"),
        '5': NstSvcTranslation.get("5"),
        '6': NstSvcTranslation.get("6"),
        '7': NstSvcTranslation.get("7"),
        '8': NstSvcTranslation.get("8"),
        '9': NstSvcTranslation.get("9"),
        '0': NstSvcTranslation.get("0")
      };

      var localizer = function(text) {
        return _.join(_.map(_.toString(text), function (char) {
          return numbers[char] || char;
        }),"");
      };

      return localizer;
    }]);
})();
