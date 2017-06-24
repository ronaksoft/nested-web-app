(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('activityItem', ActivityItem);

  /** @ngInject */
  function ActivityItem(NST_EVENT_ACTION, NstSvcLogger, NstUtility) {
    return {
      restrict: 'E',
      transclude : true,
      scope: {
        activity: '=model',
        extended: '=extended',
        currentPlaceId: '='
      },
      link: function (scope, element, attrs) {

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/activity/partials/activity-member-remove.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/activity/partials/activity-member-join.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/activity/partials/activity-place-add.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/activity/partials/activity-post-add.html';
            break;

          case NST_EVENT_ACTION.POST_ATTACH_PLACE:
            scope.tplUrl = 'app/activity/partials/activity-post-attach-place.html';
            break;

          case NST_EVENT_ACTION.POST_REMOVE_PLACE:
            scope.tplUrl = 'app/activity/partials/activity-post-remove-place.html';
            break;

          case NST_EVENT_ACTION.POST_MOVE:
            scope.tplUrl = 'app/activity/partials/activity-post-move.html';
            break;

          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/activity/partials/activity-comment-add.html';
            break;

          case NST_EVENT_ACTION.COMMENT_REMOVE:
            scope.tplUrl = 'app/activity/partials/activity-comment-remove.html';
            break;

          default:
            scope.tplUrl = '';
            return NstSvcLogger.error(NstUtility.string.format('The event type ({0}) is not supported!', scope.activity.type));
        }
        var jelement = $(element);
        jelement.mouseenter(function () {
          var hotItem = jelement.children('div.hot');
          if (hotItem.length > 0) {
            hotItem.removeClass('hot');
          }
        });
      },
      template: '<div class="evrow _fw _fn use-ng-animate" ng-class="{ hot : activity.isHot }" data-ng-include="tplUrl" data-ng-init="act = activity;extended = extended"></div>'
    };
  }

})();
