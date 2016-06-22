(function() {
  'use strict';

  angular
    .module('nested')
    .directive('recentEvent', function (moment) {
      return {
        restrict: 'A',
        scope: {
          model: '=ngModel',
        },
        link: function (scope, element, attrs) {
          var eventMoment = moment(scope.model.date);
          if (eventMoment.isAfter(moment().add('s', -5))) { // found that the event happend recently
            var item = $(element);
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
