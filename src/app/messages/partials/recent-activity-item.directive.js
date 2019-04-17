(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('recentActivityItem', RecentActivityItem);

  /**
   * switch template of each activity in messages page
   */
  function RecentActivityItem(NST_PLACE_EVENT_ACTION, NstSvcLogger, NstUtility) {
    return {
      restrict: 'E',
      replace: true,
      scope:{
        activity: '=model',
        place: '=',
        currentPlaceId: '='
      },
      link: function(scope) {

        switch (scope.activity.type) {
          case NST_PLACE_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/messages/partials/activity/member-remove.html';
            break;

          case NST_PLACE_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/messages/partials/activity/member-join.html';
            break;

          case NST_PLACE_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/messages/partials/activity/place-add.html';
            break;

          case NST_PLACE_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/messages/partials/activity/post-add.html';
            break;

          case NST_PLACE_EVENT_ACTION.POST_ATTACH_PLACE:
            scope.tplUrl = 'app/messages/partials/activity/post-attach-place.html';
            break;

          case NST_PLACE_EVENT_ACTION.POST_REMOVE_PLACE:
            scope.tplUrl = 'app/messages/partials/activity/post-remove-place.html';
            break;

          case NST_PLACE_EVENT_ACTION.POST_MOVE_TO:
            scope.tplUrl = 'app/messages/partials/activity/post-move-to.html';
            break;

          case NST_PLACE_EVENT_ACTION.POST_MOVE_FROM:
            scope.tplUrl = 'app/messages/partials/activity/post-move-from.html';
            break;

          default:
            scope.tplUrl = '';
            return NstSvcLogger.error(NstUtility.string.format('The event type ({0}) is not supported!', scope.activity.type));
        }
      },
      template: '<div class="activity-item" data-ng-include="tplUrl" data-ng-init="act = activity;currentPlaceId = currentPlaceId"></div>'
    };
  }
})();
