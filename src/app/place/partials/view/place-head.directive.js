(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('placeHead', placeHead);

  function placeHead() {
    return {
      restrict: 'E',
      scope: {
        pict : '@',
        name : '=',
        id : '@',
        private: '@',
        env : '=',
        dissmiss : '='
      },
      replace: true,
      templateUrl : 'app/place/partials/view/place-head.html',
      link: function (scope,ele,att) {

        scope.settings = scope.env == 'settings';

      }
    };

  }
})();
