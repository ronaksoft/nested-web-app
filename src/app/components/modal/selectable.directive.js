(function() {
  'use strict';
  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('selectable', selectable);

  /** @ngInject */
  function selectable($) {
    return {
      restrict: 'A',
      link : function (scope ,element) {
        $(element).click(function () {
          $(element).toggleClass('selected');
        });
      }
    };
  }
})();
