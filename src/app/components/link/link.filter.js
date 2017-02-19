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
//"<p>Dear All,</p><p>Please read this article. (Use VPN)</p><p><a href="https://developers.google.com/search/docs/guides/intro-structured-data?visit_id=1-636224336830139890-1687023591&amp;hl=en&amp;rd=1">https://developers.google.com/search/docs/guides/intro-structured-data?visit_id=1-636224336830139890-1687023591&amp;hl=en&amp;rd=1</a></p><p>&nbsp;</p><p><a href="https://developers.google.com/search/docs/guides/search-gallery">https://developers.google.com/search/docs/guides/search-gallery</a></p><p>&nbsp;</p><p>and this article for ALI @robzizo</p><p><a href="https://support.google.com/webmasters/answer/6340290?authuser=0">https://support.google.com/webmasters/answer/6340290?authuser=0</a></p><p>&nbsp;</p>"
