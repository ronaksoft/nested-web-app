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
            place: '=placeId',
            isEmail: '=',
            selectable: '=?',
            onSelect: '=',
            isSelected: '@?',
            index: '=',
            onRemove: '='
          },
          link: function (scope, element) {
            scope.isSelected = false;
            scope.visibleInput = false;
            scope.removePermission = typeof scope.onRemove === 'function'
            var template = angular.element($templateCache.get('place-chips.html'));
            if (_.isObject(scope.place)) {
              init()
            } else {
              NstSvcPlaceFactory.get(scope.place, false).then(function(place){
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
              if ( scope.selectable ) {
                try {
                  scope.onSelect(scope.placeId);
                  scope.isSelected = true;
                } catch(e) {
                  $log.debug('The item is selectable but have no registered function', e)
                }
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

            scope.keyDown = function (e) {
              console.log(e);
              if(e.which === 13) {
                scope.visibleInput = false;
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
