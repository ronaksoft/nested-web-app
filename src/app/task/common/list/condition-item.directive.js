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
      link: function ($scope, $el) {
        $scope.statusFilter = false;
        $scope.timeFilter = false;
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
        $scope.timeOptions = [
          {
            key: 'day',
            title: NstSvcTranslation.get("Day")
          },
          {
            key: 'week',
            title: NstSvcTranslation.get("Week")
          },
          {
            key: 'month',
            title: NstSvcTranslation.get("Month")
          },
          {
            key: 'year',
            title: NstSvcTranslation.get("Year")
          }
        ]
        $scope.statusOptions = [
          {
            key: 'progress',
            title: NstSvcTranslation.get("In Progress")
          },
          {
            key: 'hold',
            title: NstSvcTranslation.get("Hold")
          },
          {
            key: 'overdue',
            title: NstSvcTranslation.get("Over Due")
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
          conditionChanged(condition);
          var input = $el.find('input');
          if (input) {
            input.focus()
          }
        })

        function conditionChanged(condition) {
          switch (condition) {
            case $scope.conditions[3].key:
              $scope.equivalents = eq2;
              $scope.statusFilter = true;
              $scope.timeFilter = false;
              break;
            case $scope.conditions[5].key:
              $scope.equivalents = eq3;
              $scope.timeFilter = true;
              $scope.statusFilter = false;
              break;
            case $scope.conditions[0].key:
            case $scope.conditions[1].key:
            case $scope.conditions[2].key:
            case $scope.conditions[4].key:
            default:
              $scope.equivalents = eq1;
              $scope.timeFilter = false;
              $scope.statusFilter = false;
              break;
          }
          $scope.model.status = $scope.statusOptions[0].key
          $scope.model.time = $scope.timeOptions[0].key
          $scope.model.equivalent = $scope.equivalents[0].key;
        }
      }
    };
  }

})();
