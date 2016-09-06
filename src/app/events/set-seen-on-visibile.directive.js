(function() {
  'use strict';

  angular
    .module('nested')
    .directive('setSeenOnVisible', function (moment) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var content = $(element);
          content.on('scroll', function () {
            var recents = content.find('.hot');
            $.each(recents, function (index, e) {
              var element = $(e);
              if (element.hasClass('hot') && element.visible()) {
                element.removeClass('hot');
                element.addClass('seen');
              }
            });
          });
        }
      };
    });
})();
