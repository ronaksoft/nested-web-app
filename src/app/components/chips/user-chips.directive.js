(function () {

  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userChips', userChips);


  function userChips($templateCache, $compile, $document, _,
                     NstSvcUserFactory, $log) {

    return {
      restrict: 'A',
      scope: {
        userId: '=',
        onSelect: '=?',
        candidate: '=?',
        index: '=?',
        removable: '=?',
        isSelected: '@?',
        onRemove: '='
      },
      link: function (scope, element) {
        scope.isSelected = false;

        var template = angular.element($templateCache.get('user-chips.html'));
        if (_.isObject(scope.userId)) {
          scope.user = scope.userId;
          init();
        } else {
          NstSvcUserFactory.getCached(scope.userId).then(function (user) {
            scope.user = user;
            init();
          });
        }

        /**
         * Init the directive
         * @return {}
         */
        function init() {
          $compile(template)(scope);
          element.html(template);
        }

        scope.clearItem = function (){
          if (_.isFunction(scope.onRemove) && scope.removable !== false) {
            scope.onRemove(scope.index);
          }
        };

        scope.selectChip = function () {
          console.log('selectChip');
          try {
            scope.isSelected = true;
            scope.onSelect(scope.user);
          } catch(e) {
            $log.debug('The item is selectable but have no registered function', e)
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

        element.on('$destroy', function () {
          $document.off('click', onDocumentClick);
        });
      }
    };
  }

})();
