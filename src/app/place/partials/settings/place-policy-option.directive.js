(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .directive('placePolicyOption', placePolicyOption);

  function placePolicyOption($timeout, $templateRequest, $compile, NST_PLACE_POLICY_OPTION) {
    var levelClass = {};
    levelClass[NST_PLACE_POLICY_OPTION.MANAGERS] = "l1";
    levelClass[NST_PLACE_POLICY_OPTION.MEMBERS] = "l2";
    levelClass[NST_PLACE_POLICY_OPTION.TEAMMATES] = "l3";
    levelClass[NST_PLACE_POLICY_OPTION.EVERYONE] = "l4";

    return {
      restrict: 'E',
      replace: true,
      scope: {
        levels: '=',
        level: '=',
        levelChanged: '=',
        searchable: '=',
        searchableChanged: '=',
        placeName: '=',
        grandPlaceName: '=',
        readonly: '@'
      },
      link: function (scope, $element, attrs) {
        var rollbackTimout = null;
        scope.NST_PLACE_POLICY_OPTION = NST_PLACE_POLICY_OPTION;
        scope.hasOption = hasOption;
        scope.getLevelClass = getLevelClass;
        scope.switchLevel = switchLevel;
        scope.readonly = true;
        scope.one = _.size(scope.levels) == 1 || scope.readonly;
        scope.two = _.size(scope.levels) == 2;
        scope.three = _.size(scope.levels) == 3;
        scope.four = _.size(scope.levels) == 4;

        scope.template = scope.readonly ? 'app/place/partials/settings/place-policy-option-readonly.html' : 'app/place/partials/settings/place-policy-option.html';


        if(scope.readonly) {
          // Load the html through $templateRequest
          $templateRequest('app/place/partials/settings/place-policy-option-readonly.html').then(function(html){
            // Convert the html to an actual DOM node
            var template = angular.element(html);
            // Append it to the directive element
            $element.append(template);
            // And let Angular $compile it
            $compile(template)(scope);
          });
        } else {
          // Load the html through $templateRequest
          $templateRequest('app/place/partials/settings/place-policy-option.html').then(function(html){
            // Convert the html to an actual DOM node
            var template = angular.element(html);
            // Append it to the directive element
            $element.append(template);
            // And let Angular $compile it
            $compile(template)(scope);
          });
        }

        function hasOption(level) {
          return _.includes(scope.levels, level);
        }

        function getLevelClass(level) {
          return levelClass[level];
        }

        function switchLevel(newValue, oldValue) {
          scope.level = newValue;
          if (!_.isFunction(scope.levelChanged)) {
            return;
          }

          scope.levelChanged(newValue).catch(function (reason) {
          rollbackTimout =  $timeout(function () {
              scope.level = oldValue;
            }, 1024);
          });
        }

        scope.$on('$destroy', function () {
          if (rollbackTimout) {
            $timeout.cancel(rollbackTimout);
          }
        });

      }
    };

  }
})();
