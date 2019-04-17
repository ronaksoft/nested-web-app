(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('multipleSelect', multipleSelect);

  /** @ngInject */
  function multipleSelect(_) {
    return {
      restrict: 'E',
      replace: false,
      templateUrl: 'app/task/common/list/multiple-select.html',
      scope: {
        items: '=',
        val: '='
      },
      link: function ($scope) {
        var eventReferences = [];
        $scope.options = [];
        for (var i = 0; i < $scope.items.length; i++) {
          $scope.options.push({
            key: $scope.items[i].key,
            title: $scope.items[i].title,
            selected: $scope.val.indexOf($scope.items[i].key) > -1
          });
        }

        $scope.select = function (key) {
          var index = _.findIndex($scope.options, {key: key});
          if (index > -1) {
            $scope.options[index].selected = !$scope.options[index].selected;
          }
          var val = [];
          for (var i = 0; i < $scope.options.length; i++) {
            if ($scope.options[i].selected) {
              val.push($scope.options[i].key);
            }
          }
          $scope.val = val;
        };

        $scope.isInSelected = function (list, key) {
          return list.indexOf(key) > -1;
        };

        $scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }
    };
  }

})();
