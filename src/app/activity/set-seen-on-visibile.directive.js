(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('setSeenOnVisible', function ($) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var key = attrs.eventKey || 'body-scroll-change';
          var content = $(element);
          scope.$on(key, function () {
            $.each(content.find('.hot'), function (index, i) {
              var item = $(i);
              if (item.hasClass('hot') && item.visible()) {
                item.addClass('seen');
              }
            });

          });
        }
      };
    });
})();
