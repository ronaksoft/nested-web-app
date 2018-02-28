(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .value('suggestPickerDefaultOptions', {
      limit: 10,
      suggestsLimit: 10,
      autoFocus: false,
      singleRow: false,
      placeholder: '',
      mode: 'place',
      alwaysVisible: false
    })
    .controller('suggestPickerController', function ($timeout, $scope, _, suggestPickerDefaultOptions, toastr, NstSvcTranslation, $rootScope, NstUtility, NstVmSelectTag) {
      $scope.clearSuggests = [];
      var eventReferences = [];
      var oldkeyword = '';
      resetState();

      function addKeyItem(value) {
        if ($scope.selecteds.length >= $scope.options.limit) {
          toastr.warning(NstUtility.string.format(NstSvcTranslation.get('You can have maximum {0} attached places!'), $scope.options.limit));
          return;
        }
        var item = new NstVmSelectTag({
          id: value,
          name: value
        });
        $scope.selecteds.push(item);
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

      $scope.keyup = function (e) {
        if (e.which === 13 && !$scope.visible) {
          return;
        } else {
          $scope.visible = true;
        }
        var value = e.currentTarget.value;
        if (value && value !== oldkeyword) {
          $scope.updatedItems = false;
        }
        oldkeyword = value;
        if ($scope.state.activeSuggestItem >= $scope.clearSuggests.length) {
          $scope.state.activeSuggestItem = 0
        }
        switch (e.which) {
          case 13:
            // Enter/ return key
            if ($scope.clearSuggests.length > 0) {
              if ($scope.updatedItems) {
                var index = $scope.state.activeSuggestItem;
                e.preventDefault();
                return $scope.selectItem(index);
              } else {
                return addKeyItem(value)
              }
            }
            break;
          case 8:
            // Backspace key
            var index = $scope.state.activeSelectedItem;
            if (index > -1 && $scope.selecteds[index] && $scope.keyword.length === 0) {
              $scope.removeItem(index);
              $scope.state.activeSelectedItem = index;
              decreaseActiveSelectedIndex();
            }
            if ($scope.keyword === '' && $scope.state.activeSelectedItem < 0) {
              $scope.state.activeSelectedItem = $scope.selecteds.length - 1;
            }
            break;
          case 9:
            // Tab key
            $scope.visible = false;
            if ($scope.clearSuggests.length > 0 && $scope.keyword.length > 0) {
              var index = $scope.state.activeSuggestItem;
              return $scope.selectItem(index);
            }
            break;
          case 27:
            $scope.visible = false;
            e.target.blur();
            return e.stopPropagation();
            break;
          case 37:
            if ($scope.keyword.length > 0) {
              return;
            }
            if($rootScope._direction === 'rtl') {
              increaseActiveSelectedIndex();
            } else {
              decreaseActiveSelectedIndex();
            }
            break;
          case 38:
            decreaseActiveIndex(e.target);
            break;
          case 39:
            if ($scope.keyword.length > 0) {
              return;
            }
            if($rootScope._direction === 'ltr') {
              increaseActiveSelectedIndex();
            } else {
              decreaseActiveSelectedIndex();
            }
            break;
          case 40:
            increaseActiveIndex(e.target);
            break;
        
          default:
            break;
        }
      }

      $scope.selectItem = function (index) {
        var item = $scope.clearSuggests[index];
        if (!item || $scope.selecteds.length >= $scope.options.limit) {
          toastr.warning(NstUtility.string.format(NstSvcTranslation.get('You can have maximum {0} attached places!'), $scope.options.limit));
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
            // var suggestArea = $(el).parent().parent().find('.suggest-picker-suggests').children().eq($scope.state.activeSuggestItem);
            // suggestArea[0].scrollIntoView({
            //   behavior: "smooth"
            // });
            ensureHighlightVisible();
        } catch(e){console.log(e)}
      }

      function decreaseActiveIndex(el) {
        $scope.state.activeSuggestItem--;
        if ($scope.state.activeSuggestItem < 0) {
          $scope.state.activeSuggestItem = $scope.clearSuggests.length - 1;
        }
        try {
            // var suggestArea = $(el).parent().parent().find('.suggest-picker-suggests').children().eq($scope.state.activeSuggestItem);
            // suggestArea[0].scrollIntoView({
            //   behavior: "smooth"
            // })
            ensureHighlightVisible();
        } catch(e){console.log(e)}
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

      // See https://github.com/ivaynberg/select2/blob/3.4.6/select2.js#L1431
      function ensureHighlightVisible() {
        var container = $('.suggest-picker-suggests');
        var choices = container.children();
        if (choices.length < 1 || $scope.state.activeSuggestItem < 0) {
          return;
        }

        var highlighted = choices[$scope.state.activeSuggestItem];
        var posY = highlighted.offsetTop + highlighted.clientHeight - container[0].scrollTop;
        var height = container[0].offsetHeight;

        if (posY > height) {
          container[0].scrollTop += posY - height;
        } else if (posY < highlighted.clientHeight) {
          container[0].scrollTop -= highlighted.clientHeight - posY;
        }
      }

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
          suggestsUpdated: '=?',
          suggests: '=',
          keyword: '=',
          alwaysShow: '=?',
          requestMore: '=?',
          onFocus: '=?',
        },
        link: function ($scope, $element) {
          var containerW, itemsW = 0,
            overflowed = false,
            lastIndex = 0,
            eventReferences = [];
          $scope.options = angular.extend({}, suggestPickerDefaultOptions, $scope.config);
          $scope.tempFocusInc = $scope.options.autoFocus ? 1 : 0;
          $scope.emitItemsAnalytics = _.debounce(getSizes, 128);
          $timeout($scope.emitItemsAnalytics, 2);

          // Override parent fn
          $scope.suggestsUpdated = function() {
            optimiseSuggests($scope.suggests)
          };

          eventReferences.push($scope.$watch('suggests', optimiseSuggests));
          
          function optimiseSuggests(sug) {
            var oldL = $scope.clearSuggests.length;
            $scope.clearSuggests = _.differenceBy(sug, $scope.selecteds, 'id');
            $scope.updatedItems = true;
            if (oldL < $scope.clearSuggests.length) {
              $scope.state.activeSuggestItem = 0;
            }
          }
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
            _.forEach(eventReferences, function (canceler) {
              if (_.isFunction(canceler)) {
                canceler();
              }
            });
            $window.removeEventListener("mousedown", closePopoverDetector);
          });

          function closePopoverDetector(e) {
            $timeout(function(){
              $scope.visible = $element[0].contains(e.target.parentNode) || $element[0].contains(e.target);
            })
          }
        }
      }
    });
})();
