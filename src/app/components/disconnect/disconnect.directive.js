(function () {
  'use strict';

  angular
    .module('nested')
    .directive('disconnectMessage', function ($compile, $templateRequest, emoji) {
      return {
        restrict: 'E',
        replace: true,
        template: "<div ng-if='disconnect'" +
          " class='disconnect-message' >" +
            "<div class='reconnecting'>Disconnected from Nested server.<br />Connecting </div>" +
          "</div>",
        scope: {
          disconnect: '='
        },
        link: function (scope, tElem, tAttrs) {
          return {
            post: function (scope, element, Attr) {}
          }
        }
      };
    });
})();
