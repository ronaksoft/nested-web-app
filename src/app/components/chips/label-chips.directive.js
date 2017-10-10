(function () {
    
      'use strict';
    
      angular
        .module('ronak.nested.web.components')
        .directive('labelChips', labelChips);
    
    
      function labelChips($templateCache, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n,
        NstSvcLabelFactory) {
    
        return {
          restrict: 'A',
          scope: {
            labelId: '=',
            onClear: '='
          },
          link: function (scope, element, attrs) {
            scope.isSelected = false;
            
            var template = angular.element($templateCache.get('label-chips.html'));
            NstSvcLabelFactory.get(scope.labelId).then(function(label){
              scope.label = label;
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
    