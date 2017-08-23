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
        place: '=',
        id : '@',
        private: '@',
        env : '=',
        dissmiss : '='
      },
      replace: true,
      templateUrl : 'app/place/partials/view/place-head.html',
      link: function (scope) {

        scope.settings = scope.env == 'settings';
        scope.contact = scope.env == 'contact';

      }
    };

  }
})();
