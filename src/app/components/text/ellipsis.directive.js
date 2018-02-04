(function () {
  'use strict';

  angular.module('ronak.nested.web.components.text')
    .directive('ellipsis', ellipsis);

  function ellipsis($timeout) {
    var directive = {
      link: link,
      restrict: 'A'
    };

    function link(scope, element) {
      /**
       * postPreview - preview the places that have delete access and let the user to choose one
       *
       * @param  {type} places list of places to be shown
       */
      scope.$parent.forceTooltip = false;
      scope.forceTooltip = false;

      $timeout(function () {
        if (element[0].clientWidth < element[0].scrollWidth) {
          scope.$parent.forceTooltip = true;
          scope.forceTooltip = true;
        }
      },100);
    }

    return directive;
  }
})();
