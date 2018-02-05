(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .value('suggestPickerDefaultOptions', {
      limit: 10,
      suggestsLimit: 10,
      singleRow: false,
      placeholder: '',
      mode: 'place',
      alwaysVisible: false
    })
    .controller('suggestPickerController', function ($timeout, $scope, _, suggestPickerDefaultOptions, toastr, NstSvcTranslation, $rootScope) {
      $scope.tempFocusInc = 0;
      $scope.clearSuggests = [];
      var eventReferences = [];
      resetState();

      $scope.keydown = function (e) {
        if (!$scope.visible) {
          $scope.visible = true;
        }
        // Enter/ return key
        if (e.which === 13) {
          if ($scope.clearSuggests.length > 0) {
            var index = $scope.state.activeSuggestItem;
            return $scope.selectItem(index);
          }
          // Backspace key
        } else if (e.which === 8) {
          var index = $scope.state.activeSelectedItem;
          if (index > -1 && $scope.selecteds[index]) {
            $scope.removeItem(index);
            $scope.state.activeSelectedItem = index;
            decreaseActiveSelectedIndex();
          }
          if ($scope.keyword === '' && $scope.state.activeSelectedItem < 0) {
            $scope.state.activeSelectedItem = $scope.selecteds.length - 1;
          }
        } else if (e.which === 27) {
          $scope.visible = false;
          e.target.blur();
          return e.stopPropagation();
        } else if (e.which === 37) {
          if($rootScope._direction === 'rtl') {
            increaseActiveSelectedIndex();
          } else {
            decreaseActiveSelectedIndex();
          }
        } else if (e.which === 38) {
          decreaseActiveIndex(e.target);
        } else if (e.which === 39) {
          if($rootScope._direction === 'ltr') {
            increaseActiveSelectedIndex();
          } else {
            decreaseActiveSelectedIndex();
          }
        } else if (e.which === 40) {
          increaseActiveIndex(e.target);
        }
      }

      $scope.selectItem = function (index) {
        var item = $scope.clearSuggests[index];
        if (!item || $scope.selecteds.length >= $scope.options.limit) {
          toastr.warning(NstSvcTranslation.get("Limit is :") + " " + $scope.options.limit)
          return;
        }
        $scope.selecteds.push(item);
        $scope.clearSuggests.splice(index, 1);
        $scope.keyword = '';
        ++$scope.tempFocusInc;
        resetState();
        if (typeof $scope.requestMore === 'function') {
          $scope.requestMore();
        }
        if ($scope.options.singleRow) {
          $scope.emitItemsAnalytics();
        }
        $scope.visible = false;
      }

      $scope.removeItem = function (index) {
        var item = $scope.selecteds[index];
        if (index < 0 || !item) {
          return;
        }
        $scope.clearSuggests.unshift(item);
        $scope.selecteds.splice(index, 1);
        resetState();
        if ($scope.options.singleRow) {
          $scope.emitItemsAnalytics();
        }
      }

      $scope.activeSelectItem = function (place) {
        var index = _.findIndex($scope.selecteds, function (p) {
          return p.id === place.id
        })
        $scope.state.activeSelectedItem = index;
      }

      // todo: Remove on destroy
      eventReferences.push($scope.$watch('suggests', function (sug) {
        var oldL = $scope.clearSuggests.length;
        $scope.clearSuggests = _.differenceBy(sug, $scope.selecteds, 'id');
        if (oldL < $scope.clearSuggests.length) {
          $scope.state.activeSuggestItem = 0;
        }
      }));
      eventReferences.push($scope.$watch('visible', function (ss) {
        console.log(ss)
      }));

      /**
       * Reset / Initialize view states
       */
      function resetState() {
        $scope.state = {
          activeSuggestItem: 0,
          activeSelectedItem: -1
        }
      }

      function increaseActiveIndex(el) {
        $scope.state.activeSuggestItem++;
        if ($scope.state.activeSuggestItem === $scope.clearSuggests.length) {
          $scope.state.activeSuggestItem = 0;
        }
        try {
            var suggestArea = $(el).parent().parent().find('.suggest-picker-suggests').children().eq($scope.state.activeSuggestItem);
            suggestArea[0].scrollIntoView({
              behavior: "smooth"
            });
        } catch(e){}
      }

      function decreaseActiveIndex(el) {
        $scope.state.activeSuggestItem--;
        if ($scope.state.activeSuggestItem < 0) {
          $scope.state.activeSuggestItem = $scope.clearSuggests.length - 1;
        }
        try {
            var suggestArea = $(el).parent().parent().find('.suggest-picker-suggests').children().eq($scope.state.activeSuggestItem);
            suggestArea[0].scrollIntoView({
              behavior: "smooth"
            })
        } catch(e){}
      }

      function increaseActiveSelectedIndex() {
        $scope.state.activeSelectedItem++;
        if ($scope.state.activeSelectedItem === $scope.selecteds.length) {
          $scope.state.activeSelectedItem = 0;
        }
      }

      function decreaseActiveSelectedIndex() {
        $scope.state.activeSelectedItem--;
        if ($scope.state.activeSelectedItem < 0) {
          $scope.state.activeSelectedItem = $scope.selecteds.length - 1;
        }
      }

      $scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (cenceler) {
          if (_.isFunction(cenceler)) {
            cenceler();
          }
        });
      });
    })
    .directive('suggestPicker', function ($timeout, $, _, suggestPickerDefaultOptions, $window) {
      return {
        restrict: 'E',
        controller: 'suggestPickerController',
        templateUrl: 'app/components/suggest-picker/suggest-picker.html',
        controllerAs: 'ctrl',
        bindToController: false,
        replace: true,
        scope: {
          config: '=?',
          selecteds: '=',
          suggests: '=',
          keyword: '=',
          alwaysShow: '=?',
          requestMore: '=?',
        },
        link: function ($scope, $element) {
          var containerW, itemsW = 0,
            overflowed = false,
            lastIndex = 0;
          $scope.options = angular.extend({}, suggestPickerDefaultOptions, $scope.config);
          $scope.emitItemsAnalytics = _.debounce(getSizes, 128);
          $timeout($scope.emitItemsAnalytics, 2);

          /**
           * @function
           * for ui treatments
           * this function collapse the recipients box into one line and adds 
           * an element called `more-recipient-badge` at the end of first line
           */
          function getSizes() {
            // remove `more-recipient-badge` element 
            $('#more-recipient-badge').remove();
            itemsW = 0;
            overflowed = false;
            containerW = $element.width();;
            var childs = $element.find('.suggest-picker-area').children();
            $timeout(function () {
              if (childs.length > 1) {
                for (var i = 0; i < childs.length - 1; i++) {

                  if (!overflowed) {
                    itemsW += childs[i].offsetWidth;
                    lastIndex = i;
                  }

                  if (itemsW + 32 > containerW) {
                    overflowed = true;
                  }

                }
                if (overflowed) {
                  var x = childs.length - 1 - lastIndex;
                  $element.children().children().eq(lastIndex - 1).after('<span id="more-recipient-badge">+' + x + '</span>');
                }
              }
            }, 2);

          }

          $window.addEventListener("mousedown", closePopoverDetector);

          $scope.$on('$destroy', function () {
            $window.removeEventListener("mousedown", closePopoverDetector);
          });

          function closePopoverDetector(e) {
            $scope.visible = $element[0].contains(e.target.parentNode) || $element[0].contains(e.target);
          }
        }
      }
    });
})();
