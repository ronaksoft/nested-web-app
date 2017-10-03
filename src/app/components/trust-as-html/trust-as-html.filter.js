(function () {
  angular
    .module('ronak.nested.web.components.text')
    .filter('trustAsHtml', ['$sce', function ($sce) {
        return function (content) {
            return $sce.trustAsHtml(content);
        };
    }]);
})();
