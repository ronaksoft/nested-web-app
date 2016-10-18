(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .directive('nstSidebarToggleAgent', SidebarToggleAgent);

  /** @ngInject */
  function SidebarToggleAgent($location, $timeout, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        toggleAgentSwitch: '='
      },
      link: function($scope, $element, $attrs) {
        var jElement = $($element[0]);
        $rootScope.$on('$stateChangeSuccess', function() {

          jElement.off('click');
          if ($attrs.href && isCurrentViewLink($attrs.href)) {
            jElement.on('click', function(event) {
              console.log($scope.toggleAgentSwitch);
              $scope.toggleAgentSwitch = !$scope.toggleAgentSwitch;
            });
          }
        });
      }
    };

    function isCurrentViewLink(url) {
      return $location.path() === _.trimStart(url, '#');
    }

  }
})();
