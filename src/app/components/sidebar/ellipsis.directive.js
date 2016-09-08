(function () {
  'use strict';

  angular.module('nested')
    .directive('ellipsis', ellipsis);

  function ellipsis() {
    var directive = {
      link: link,
      template: function(element, attrs) {
        var tag = element[0].nodeName;
        return '<' + tag + ' ng-mouseenter="ellipsisControl()" data-uib-tooltip="{{name}}" data-tooltip-enable="{{tooltipEnabled}}" data-tooltip-append-to-body="true" data-tooltip-placement="top auto" ng-transclude></' + tag +'>';
      },
      restrict: 'A',
      scope: {
        name: '=ellipsis'
      },
      replace: true,
      transclude: true
    };

    function link(scope, element, attrs) {
      /**
       * postPreview - preview the places that have delete access and let the user to choose one
       *
       * @param  {type} places list of places to be shown
       */
      scope.ellipsisControl = function () {
        if (element[0].clientWidth < element[0].scrollWidth) {
          scope.tooltipEnabled = true;
        }
      }
    }

    return directive;
  }
})();
