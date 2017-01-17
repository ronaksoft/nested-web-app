(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components.scroll');
  app.directive('scrollToView', scrollToView);

  function scrollToView() {
    return {
      restrict : 'A',
      link: link
    };

    function link($scope, $element, $attrs) {
      if (!$attrs["id"]) {
        throw Error("Could not scroll the element into view withoud specifing id attribute on the element.");
      }

      $scope.$on('scroll-to-view', function (event, data) {
        if (data.id === $attrs["id"]) {
          console.log('scroll the post card to view');
        }
      });
    }

  }

})();
