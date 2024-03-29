(function () {
  angular
    .module('ronak.nested.web.components.text')
    .filter('link', ['$filter', function ($filter) {
      return function (value) {
        if (!value) {
          return '';
        }

        var reg = new RegExp("<(/?)[a|A](.*?)>", "g");
        var newString = value.replace(reg, function (match, p1, p2) {
          return "<" + p1 + "span" + p2 + ">";
        });
        newString = newString.replace(/href=['|"](.*?)['|"]/g, function () {
          return ""
        });
        var linked = $filter('linky')(newString, '_blank');
        var dom = new DOMParser();
        var parser = dom.parseFromString(linked,'text/html');
        return parser.body.innerHTML;
      };
    }])
    .filter('unsafe', ['$sce', function ($sce) {
      return $sce.trustAsHtml;
    }]);
})();
