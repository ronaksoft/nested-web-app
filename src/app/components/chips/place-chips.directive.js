(function () {
    
      'use strict';
    
      angular
        .module('ronak.nested.web.components')
        .directive('placeChips', placeChips);
    
    
      function placeChips($templateCache, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n,
        NstSvcPlaceFactory) {
    
        return {
          restrict: 'A',
          scope: {
            placeId: '=',
            isEmail: '=',
            selectable: '=?',
            onClear: '='
          },
          link: function (scope, element, attrs) {
            scope.isSelected = false;
            
            var template = angular.element($templateCache.get('place-chips.html'));
            NstSvcPlaceFactory.get(scope.placeId, false).then(function(place){
              scope.place = place;
              init();
            }).catch(function(e){
              console.log(e)
            })
            /**
             * Init the directive
             * @return {}
             */
            function init() {
    
              $compile(template)(scope);
              element.html(template);
            }
    
            scope.selectChip = function (){
              if ( scope.selectable ) {
                scope.isSelected = true;
              }
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
    