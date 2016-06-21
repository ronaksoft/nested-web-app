(function() {
  'use strict';

  angular
    .module('nested')
    .directive('seenRecents', function (moment) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var content = $(element);
          content.on('scroll', function () {
            var recents = $(element[0]).find('.recent');
            $.each(recents, function (index, e) {
              var element = $(e);
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
