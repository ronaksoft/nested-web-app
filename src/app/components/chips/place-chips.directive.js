(function () {
    
      'use strict';
    
      angular
        .module('ronak.nested.web.components')
        .directive('placeChips', placeChips);
    
    
      function placeChips($templateCache, $log, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n,
        NstSvcPlaceFactory, _) {
    
        return {
          restrict: 'A',
          scope: {
            placeId: '=',
            isEmail: '=',
            selectable: '=?',
            onSelect: '=',
            index: '=',
            onRemove: '='
          },
          link: function (scope, element, attrs) {
            scope.isSelected = false;
            scope.removePermission = typeof scope.onRemove === 'function'
            var template = angular.element($templateCache.get('place-chips.html'));
            if (_.isObject(scope.placeId)) {
              scope.place = scope.placeId;
              init()
            } else {
              NstSvcPlaceFactory.get(scope.placeId, false).then(function(place){
                scope.place = place;
                init();
              }).catch(function(e){
                $log.debug(e)
              })
            }
            /**
             * Init the directive
             * @return {}
             */
            function init() {
    
              $compile(template)(scope);
              element.html(template);
            }
    
            scope.selectChip = function (){
              if ( !scope.selectable ) {
                return;
              }
                scope.isSelected = true;
                try {
                  scope.onSelect(scope.placeId);
                } catch(e) {
                  $log.debug('The item is selectable but have no registered function')
                }
            }
            scope.clearItem = function (){
              scope.onRemove(scope.index);
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
    