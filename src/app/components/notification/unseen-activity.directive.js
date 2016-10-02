(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components');

  app.directive('nstUnseenActivity', nstUnseenActivity);

  function nstUnseenActivity($rootScope, NstUtility) {
    var defaultTitle = null;
    var template = '({0}) {1}';

    return {
      restrict : 'E',
      scope : {},
      link: link
    };

    function link($scope, $element, $attrs) {
      defaultTitle = document.title;

      $rootScope.$on('unseen-activity-notify', function (event, value) {
        setTitle(value);
      });

      $rootScope.$on('unseen-activity-clear', function () {
        resetTitle();
      });

      function resetTitle() {
        document.title = defaultTitle;
      }

      function setTitle(count) {
        if (count > 0) {
          document.title = NstUtility.string.format(template, count, defaultTitle);
        } else {
          resetTitle();
        }
      }
    }
  }

})();
