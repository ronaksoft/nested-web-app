(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('placeMainSettings', function() {
      var templates = {
        'grand' : 'grand-place-settings.html',
        'sub-personal': 'sub-personal-place-settings.html',
        'common' : 'common-place-settings.html',
        'private' : 'private-place-settings.html'
      };

      return {
        restrict: 'E',
        template: '<ng-include src="template"/>',
        controller: 'PlaceMainSettingsController',
        controllerAs: 'ctrl',
        bindToController: true,
        scope: {
          place: '='
        },
        link: function(scope, element, attrs) {
          if (!attrs.placeType) {
            throw Error('place-type is not specified');
          }

          if (!_.has(templates, attrs.placeType)) {
            throw Error('place-type is invalid, select between : ' + _.join(_.keys(templates), ","));
          }

          scope.template = 'app/place/settings/main/' + templates[attrs.placeType];
        }
      };
    });

})();
