(function() {
  'use strict';

  angular
    .module('nested')
    .directive('seenRecents', function (moment) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var content = angular.element(element);
          content.on('scroll', function () {
            var recents = angular.element(element[0]).find('.recent');
            angular.element.each(recents, function (index, e) {
              var element = angular.element(e);
              if (element.hasClass('recent') && element.visible()) {
                element.removeClass('recent');
                element.addClass('seen');
              }
            });
          });
        }
      };
    });
})();
