(function () {
  angular
    .module('ronak.nested.web.components.text')
    .filter('link', ['$filter', function ($filter) {
      return function (value) {
        var reg = new RegExp("<(/?)[a|A](.*?)>", "g");
        var newString = value.replace(reg, function (match, p1, p2) {
          return "<" + p1 + "span" + p2 + ">";
        });
        newString = newString.replace(/href=['|"](.*?)['|"]/g, function (match, p1) {
          return ""
        });
        var linked = $filter('linky')(newString);
        return linked;
      };
    }]);
})();
