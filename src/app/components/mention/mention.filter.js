(function () {
  angular
    .module('ronak.nested.web.components.text')
    .filter('mention', ['$interpolate', function ($interpolate) {
      return function (value) {
        if (!value) {
          return '';
        }

        var reg = new RegExp(/\B@[a-z0-9_-]+/, "g");
        var newString = value.replace(reg, function (match, p1, p2) {
          var nv = '<abbr class="nst-user-popover" user-detail="' + match.replace('@', '') + '" style="display: inline-block;">' + match + '</abbr>';
          return nv;
        });
        return newString;
      };
    }])
    .filter('unsafe', ['$sce', function ($sce) {
      return $sce.trustAsHtml;
    }]);
})();
