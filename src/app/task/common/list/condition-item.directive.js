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
        $scope.data = {
          user: '',
          label: '',
          keyword: '',
          unit: 'day',
          range: 1,
          status: 'progress'
        };
        var eq1 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          },
          {
            key: 'isAny',
            title: NstSvcTranslation.get("in any of")
          }
        ];
        var eq2 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          }
        ];
        var eq3 = [{
            key: 'is',
            title: NstSvcTranslation.get("is")
          },
          {
            key: 'isNext',
            title: NstSvcTranslation.get("is next")
          }
        ];
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
        ];
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
        ];
        $scope.equivalents = eq1;
        $scope.conditions = [{
            key: 'assignee',
            title: NstSvcTranslation.get("Assignee")
          },
          {
            key: 'assignor',
            title: NstSvcTranslation.get("Assignor")
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
          }
        ];

        $scope.$watch('model.condition', function (condition) {
          conditionChanged(condition);
          var input = $el.find('input');
          if (input) {
            input.focus()
          }
        });

        function conditionChanged(condition) {
          switch (condition) {
            case $scope.conditions[3].key:
              $scope.equivalents = eq2;
              break;
            case $scope.conditions[5].key:
              $scope.equivalents = eq3;
              break;
            case $scope.conditions[0].key:
            case $scope.conditions[1].key:
            case $scope.conditions[2].key:
            case $scope.conditions[4].key:
            default:
              $scope.equivalents = eq1;
              break;
          }
          $scope.model.status = $scope.statusOptions[0].key;
          $scope.model.time = $scope.timeOptions[0].key;
          $scope.model.equivalent = $scope.equivalents[0].key;
        }

        $scope.$watch(function () {
          return $scope.data;
        }, function (newVal) {
          if (newVal.user.indexOf(',') > -1) {
            var users = newVal.user.split(',');
            users = users[users.length - 2];
            $scope.data.user = users.replace(/\s/g, '') + ', ';
          }
        }, true);
      }
    };
  }

})();
