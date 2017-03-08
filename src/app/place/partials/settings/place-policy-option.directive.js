(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('placePolicyOption', placePolicyOption);

  function placePolicyOption(NST_PLACE_POLICY_OPTION) {
    var levelClass = {};
    levelClass[NST_PLACE_POLICY_OPTION.MANAGERS] = "l1";
    levelClass[NST_PLACE_POLICY_OPTION.MEMBERS] = "l2";
    levelClass[NST_PLACE_POLICY_OPTION.TEAMMATES] = "l3";
    levelClass[NST_PLACE_POLICY_OPTION.EVERYONE] = "l4";

    return {
      restrict: 'E',
      templateUrl : 'app/place/partials/settings/place-policy-option.html',
      scope: {
        levels: '=',
        level: '=',
        levelChanged: '=',
        searchable: '=',
        searchableChanged: '=',
        placeName: '=',
        grandPlaceName: '=',
        readonly: '='
      },
      link: function (scope, element, attrs) {

        scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
        scope.hasOption = hasOption;
        scope.getLevelClass = getLevelClass;
        scope.switchLevel = switchLevel;

        scope.two = _.size(scope.levels) == 2;
        scope.three = _.size(scope.levels) == 3;
        scope.four = _.size(scope.levels) == 4;

        function hasOption(level) {
          return _.includes(scope.levels, level);
        }

        function getLevelClass(level) {
          return levelClass[level];
        }

        function switchLevel(level) {
          if (!_.isFunction(scope.levelChanged)) {
            return;
          }

          scope.levelChanged(level).catch(function (reason) {
            scope.level = !level;
          });
        }

      }
    };

  }
})();
