(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('recieveFrom', recieveFrom);

  function recieveFrom() {
    return {
      restrict: 'E',
      scope: {
        level : '=',
        env : '='
      },
      templateUrl : 'app/place/partials/settings/post-receive-setting.html',
      link: function (scope,ele,att) {

        scope.semi = scope.env == 'semi';

      }
    };

  }
})();
