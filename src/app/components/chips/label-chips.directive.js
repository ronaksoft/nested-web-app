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
        selectable: '=?',
        index: '=?',
        onRemove: '=',
        isSelected: '@?',
        onClick: '=?',
        onSelect: '=',
        removable: '=?'
      },
      link: function (scope, element) {
        scope.isSelected = false;

        if (scope.removable === undefined) {
          scope.removable = true;
        }

        var template = angular.element($templateCache.get('label-chips.html'));
        if (_.isObject(scope.labelId)) {
          scope.label = scope.labelId;
          init();
        } else {
          NstSvcLabelFactory.get(scope.labelId).then(function (label) {
            scope.label = label;
            init();
          })/*.catch(function (e) {
            console.log(e)
          })*/;
        }

        function init() {
          $compile(template)(scope);
          element.html(template);
        }

        scope.selectChip = function () {
          if (scope.selectable) {
            scope.isSelected = true;
          }
          if (_.isFunction(scope.onSelect)) {
            scope.onSelect( typeof scope.index !== 'undefined' ? scope.index : scope.labelId);
          }
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

        scope.removeChip = function (e) {
          if (_.isFunction(scope.onRemove) && (scope.label.public || scope.label.isMember) && scope.removable === true) {
            scope.onRemove( typeof scope.index !== 'undefined' ? scope.index : scope.labelId);
            e.preventDefault();
            e.stopPropagation();
          }
        };

        element.on('$destroy', function () {
          $document.off('click', onDocumentClick);
        });

      }
    };
  }

})();
