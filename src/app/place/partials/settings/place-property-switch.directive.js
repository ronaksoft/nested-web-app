(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('placePropertySwitch', placePropertySwitch);

  function placePropertySwitch() {
    return {
      restrict: 'E',
      templateUrl : 'app/place/partials/settings/post-receive-setting.html',
      scope: {
        env : '=',
        level : '=',
        levelChanged: '=',
        searchable: '=',
        searchableChanged: '=',
        placeName: '=',
        grandPlaceName: '=',
        readonly: '='
      },
      link: function (scope, element, attrs) {

        scope.semi = scope.env == 'semi';
        scope.three = scope.env == 'three';
        scope.full = scope.env == 'full'

      }
    };

  }
})();
