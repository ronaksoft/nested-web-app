(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('conditionItem', conditionItem);

  /** @ngInject */
  function conditionItem(NstSvcTranslation) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/task/common/list/condition-item.html',
      scope: {
        model: '='
      },
      link: function ($scope) {
        var eq1 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          },
          {
            key: 'isAny',
            title: NstSvcTranslation.get("in any of")
          },
        ]
        var eq2 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          }
        ]
        var eq3 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          },
          {
            key: 'isNext',
            title: NstSvcTranslation.get("is next")
          }
        ]
        $scope.equivalents = eq1;
        $scope.conditions = [{
            key: 'assigne',
            title: NstSvcTranslation.get("Assigne")
          },
          {
            key: 'assignor',
            title: NstSvcTranslation.get(" Assignor")
          },
          {
            key: 'label',
            title: NstSvcTranslation.get("Label")
          },
          {
            key: 'status',
            title: NstSvcTranslation.get("Status")
          },
          {
            key: 'keyword',
            title: NstSvcTranslation.get("Keyword")
          },
          {
            key: 'dueTime',
            title: NstSvcTranslation.get("Due Time")
          },
        ];
        $scope.$watch('model.condition', function (condition) {
          updateEq(condition)
        })

        function updateEq(condition) {
          if (
            condition === $scope.conditions[0].key ||
            condition === $scope.conditions[1].key ||
            condition === $scope.conditions[2].key ||
            condition === $scope.conditions[4].key
          ) {
            $scope.equivalents = eq1;
          } else if (condition === $scope.conditions[3].key) {
            $scope.equivalents = eq2;
          } else if (condition === $scope.conditions[5].key) {
            $scope.equivalents = eq3;
          }
        }
      }
    };
  }

})();
