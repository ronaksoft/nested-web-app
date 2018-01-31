(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .value('suggestPickerDefaultOptions', {
      limit: 0,
      mode: 'place'
    })
    .controller('suggestPickerController', function ($timeout, $scope, _) {
      $scope.tempFocusInc = 0;
      resetState();

      $scope.keydown = function (e) {
        // Enter/ return key
        if(e.which === 13) {
          if($scope.clearSuggests.length > 0) {
            var index = $scope.state.activeSuggestItem;
            $scope.selectItem(index);
          }
          // Backspace key
        } else if(e.which === 8) {
          var index = $scope.state.activeSelectedItem;
          if (index > -1 && $scope.selecteds[index]){
            $scope.removeItem(index);
            $scope.state.activeSelectedItem = index;
            decreaseActiveSelectedIndex();
          }
          if ($scope.keyword === '' && $scope.state.activeSelectedItem < 0) {
            $scope.state.activeSelectedItem = $scope.selecteds.length - 1;
          }
        } else if(e.which === 37) {
          decreaseActiveSelectedIndex();
        } else if(e.which === 38) {
          decreaseActiveIndex();
        } else if(e.which === 39) {
          increaseActiveSelectedIndex();
        } else if(e.which === 40) {
          increaseActiveIndex();
        }
      }

      $scope.selectItem = function (index) {
        var item = $scope.clearSuggests[index];
        if (!item) {
          return;
        }
        $scope.selecteds.push(item);
        $scope.clearSuggests.splice(index, 1);
        $scope.keyword = '';
        ++$scope.tempFocusInc;
        resetState();
      }

      $scope.removeItem = function (index) {
        var item = $scope.selecteds[index];
        if (index > -1 && item){
          $scope.clearSuggests.push(item);
          $scope.selecteds.splice(index, 1);
          resetState();
        }
      }

      $scope.activeSelectItem = function (place) {
        var index = _.findIndex($scope.selecteds, function(p){
          return p.id === place.id
        })
        $scope.state.activeSelectedItem = index;
      }

      // todo: Remove on destroy
      $scope.$watch('suggests', function (sug) {
        $scope.clearSuggests = _.differenceBy(sug, $scope.selecteds, 'id');
      });

      /**
       * Reset / Initialize view states
       */
      function resetState() {
        $scope.state = {
          activeSuggestItem: 0,
          activeSelectedItem: -1
        }
      }

      function increaseActiveIndex() {
        $scope.state.activeSuggestItem++;
        if($scope.state.activeSuggestItem === $scope.clearSuggests.length) {
          $scope.state.activeSuggestItem = 0;
        }
      }

      function decreaseActiveIndex() {
        $scope.state.activeSuggestItem--;
        if($scope.state.activeSuggestItem < 0) {
          $scope.state.activeSuggestItem = $scope.clearSuggests.length - 1;
        }
      }

      function increaseActiveSelectedIndex() {
        $scope.state.activeSelectedItem++;
        if($scope.state.activeSelectedItem === $scope.selecteds.length) {
          $scope.state.activeSelectedItem = 0;
        }
      }

      function decreaseActiveSelectedIndex() {
        $scope.state.activeSelectedItem--;
        if($scope.state.activeSelectedItem < 0) {
          $scope.state.activeSelectedItem = $scope.selecteds.length - 1;
        }
      }
    })
    .directive('suggestPicker', function ($timeout, $, suggestPickerDefaultOptions) {
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
        },
        link: function ($scope, $element) {
          var options = angular.extend({}, suggestPickerDefaultOptions, $scope.config);
        }
      }
    });
})();
