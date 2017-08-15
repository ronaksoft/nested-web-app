(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarToggleAgent', SidebarToggleAgent);

  /** @ngInject */
  function SidebarToggleAgent($location, $rootScope, $) {
    return {
      restrict: 'A',
      scope: {
        toggleAgentSwitch: '='
      },
      link: function($scope, $element, $attrs) {
        var jElement = $($element[0]);

        var hrefWatcherCleaner = $scope.$watch(function () {
          return $attrs.href;
        }, function (newValue) {
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
              jElement.on('click', function() {
                $scope.$apply(function () {

                  //FIXME What is toggleAgentSwitch ?!
                  $scope.$emit('collapse-sidebar');
                });
              });
            }
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
