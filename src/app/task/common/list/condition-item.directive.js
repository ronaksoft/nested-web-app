(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('conditionItem', conditionItem);

  /** @ngInject */
  function conditionItem(NstSvcTranslation, NST_CUSTOM_FILTER) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/task/common/list/condition-item.html',
      scope: {
        model: '=',
        selectedItems: '=',
        index: '='
      },
      link: function ($scope, $el) {
        var eventReferences = [];
        $scope.conConst = NST_CUSTOM_FILTER;
        var eq1 = [{
            key: NST_CUSTOM_FILTER.LOGIC_AND,
            title: NstSvcTranslation.get('contain all of')
          },
          {
            key: NST_CUSTOM_FILTER.LOGIC_OR,
            title: NstSvcTranslation.get('contain any of')
          }
        ];
        var eq3 = [{
            key: NST_CUSTOM_FILTER.LOGIC_IS,
            title: NstSvcTranslation.get('is')
          },
          {
            key: NST_CUSTOM_FILTER.LOGIC_IS_NEXT,
            title: NstSvcTranslation.get('is next')
          }
        ];
        $scope.timeOptions = [
          {
            key: NST_CUSTOM_FILTER.UNIT_DAY,
            title: NstSvcTranslation.get('Day')
          },
          {
            key: NST_CUSTOM_FILTER.UNIT_WEEK,
            title: NstSvcTranslation.get('Week')
          },
          {
            key: NST_CUSTOM_FILTER.UNIT_MONTH,
            title: NstSvcTranslation.get('Month')
          },
          {
            key: NST_CUSTOM_FILTER.UNIT_YEAR,
            title: NstSvcTranslation.get('Year')
          }
        ];
        $scope.statusOptions = [
          {
            key: NST_CUSTOM_FILTER.STATUS_PROGRESS,
            title: NstSvcTranslation.get('In Progress')
          },
          {
            key: NST_CUSTOM_FILTER.STATUS_HOLD,
            title: NstSvcTranslation.get('Hold')
          },
          {
            key: NST_CUSTOM_FILTER.STATUS_OVERDUE,
            title: NstSvcTranslation.get('Over Due')
          }
        ];
        $scope.equivalents = eq1;
        $scope.conditions = [{
            key: NST_CUSTOM_FILTER.CONDITION_ASSIGNEE,
            title: NstSvcTranslation.get('Assignee')
          },
          {
            key: NST_CUSTOM_FILTER.CONDITION_ASSIGNOR,
            title: NstSvcTranslation.get('Assignor')
          },
          {
            key: NST_CUSTOM_FILTER.CONDITION_LABEL,
            title: NstSvcTranslation.get('Label')
          },
          {
            key: NST_CUSTOM_FILTER.CONDITION_STATUS,
            title: NstSvcTranslation.get('Status')
          },
          {
            key: NST_CUSTOM_FILTER.CONDITION_KEYWORD,
            title: NstSvcTranslation.get('Keyword')
          },
          {
            key: NST_CUSTOM_FILTER.CONDITION_DUE_TIME,
            title: NstSvcTranslation.get('Due Time')
          }
        ];

        eventReferences.push($scope.$watch('model.condition', function (condition) {
          conditionChanged(condition);
          var input = $el.find('input');
          if (input) {
            input.focus()
          }
        }));

        function conditionChanged(condition) {
          switch (condition) {
            case NST_CUSTOM_FILTER.CONDITION_LABEL:
              $scope.equivalents = eq1;
              break;
            case NST_CUSTOM_FILTER.CONDITION_DUE_TIME:
              $scope.equivalents = eq3;
              break;
            case NST_CUSTOM_FILTER.CONDITION_ASSIGNEE:
            case NST_CUSTOM_FILTER.CONDITION_ASSIGNOR:
            case NST_CUSTOM_FILTER.CONDITION_KEYWORD:
            case NST_CUSTOM_FILTER.CONDITION_STATUS:
            default:
              $scope.equivalents = [];
              break;
          }
        }

        $scope.getConditions = function () {
          var selectedConditions = _.map($scope.selectedItems, function (item) {
            return {
              key: item.condition
            };
          });
          selectedConditions = selectedConditions.slice(0, $scope.index);
          return _.differenceBy($scope.conditions, selectedConditions, 'key');
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
