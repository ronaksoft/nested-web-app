(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarToggleAgent', SidebarToggleAgent);

  /** @ngInject */
  function SidebarToggleAgent($location, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        toggleAgentSwitch: '='
      },
      link: function($scope, $element, $attrs) {
        var jElement = $($element[0]);

        var hrefWatcherCleaner = $scope.$watch(function () {
          return $attrs.href;
        }, function (newValue, oldValue) {
          if (newValue) {
            setClickBehaviour();
          }
        });

        $rootScope.$on('$stateChangeSuccess', function() {
          setClickBehaviour();
        });

        function setClickBehaviour() {
          jElement.off('click');
          if ($attrs.href) {
            if (isCurrentViewLink($attrs.href)) {
              jElement.on('click', function(event) {
                $scope.$apply(function () {
                  $scope.toggleAgentSwitch = !$scope.toggleAgentSwitch;
                });
              });
            }
            // @NOTE : The else block closes the sidebar on chosing another item
            // else {
            //   jElement.on('click', function(event) {
            //     if ($scope.toggleAgentSwitch) {
            //       $scope.$apply(function () {
            //         $scope.toggleAgentSwitch = false;
            //       });
            //     }
            //   });
            // }
          }
        }

        $scope.$on('$destroy', function () {
          hrefWatcherCleaner();
        });
      }

    };

    function isCurrentViewLink(url) {
      return $location.path() === _.trimStart(url, '#');
    }

  }
})();
