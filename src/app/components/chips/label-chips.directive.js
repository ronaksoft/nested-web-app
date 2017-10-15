(function () {

  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('labelChips', labelChips);


  function labelChips($templateCache, $compile, $document,
                      NstSvcLabelFactory, _) {

    return {
      restrict: 'A',
      scope: {
        labelId: '=',
        onRemove: '='
      },
      link: function (scope, element) {
        scope.isSelected = false;

        var template = angular.element($templateCache.get('label-chips.html'));
        if (_.isObject(scope.labelId)) {
          scope.label = scope.labelId;
          init();
        } else {
          NstSvcLabelFactory.get(scope.labelId).then(function (label) {
            scope.label = label;
            init();
          }).catch(function (e) {
            console.log(e)
          })
        }

        function init() {
          $compile(template)(scope);
          element.html(template);
        }

        scope.selectChip = function () {
          scope.isSelected = true;
        };

        scope.unselectChip = function () {
          scope.isSelected = false;
        };

        var onDocumentClick = function (event) {
          if (element[0] !== event.target) {
            scope.isSelected = false;
          }
        };

        $document.on('click', onDocumentClick);

        scope.removeChip = function () {
          if (_.isFunction(scope.onRemove)) {
            scope.onRemove(scope.labelId);
          }
        };

        element.on('$destroy', function () {
          $document.off('click', onDocumentClick);
        });

      }
    };
  }

})();
