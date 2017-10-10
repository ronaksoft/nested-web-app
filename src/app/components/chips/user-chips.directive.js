(function () {

  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userChips', userChips);


  function userChips($templateCache, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n,
    NstSvcUserFactory) {

    return {
      restrict: 'A',
      scope: {
        userId: '=',
        onClear: '='
      },
      link: function (scope, element, attrs) {
        scope.isSelected = false;
        
        var template = angular.element($templateCache.get('user-chips.html'));
        NstSvcUserFactory.get(scope.userId).then(function(user){
          scope.user = user;
          init();
        })
        /**
         * Init the directive
         * @return {}
         */
        function init() {

          $compile(template)(scope);
          element.after(template);
        }

        scope.selectChip = function (){
          scope.isSelected = true;
        }
        scope.unselectChip = function (){
          scope.isSelected = false;
        }
        var onDocumentClick = function (event) {
          if (element[0] !== event.target) {
            scope.isSelected = false;
          }
        };
        $document.on('click', onDocumentClick);
        scope.closeChip = function (){
          if (typeof scope.onClear === 'function') {
            scope.onClear();
          }
        }
        element.on('$destroy', function () {
          $document.off('click', onDocumentClick);
        });

      }
    };
  }

})();
