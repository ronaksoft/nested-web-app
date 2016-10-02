(function() {
  'use strict';

  angular
    .module('nested')
    .directive('recentEvent', function (moment) {
      return {
        restrict: 'A',
        scope: {
          model: '=ngModel'
        },
        link: function (scope, element, attrs) {
          var eventMoment = moment(scope.model.date);
          if (eventMoment.isAfter(moment().add(-5, 's'))) { // found that the event happend recently
            var item = angular.element(element);
            if (item.visible()){
              item.addClass('seen');
            } else {
              item.addClass('recent');
            }
          }
        }
      };
    });
})();
