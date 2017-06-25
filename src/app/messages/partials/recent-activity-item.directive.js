(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('recentActivityItem', RecentActivityItem);

  /**
   * switch template of each activity in messages page
   */
  function RecentActivityItem(NST_EVENT_ACTION, NstSvcLogger, NstUtility) {
    return {
      restrict: 'E',
      replace: true,
      scope:{
        activity: '=model',
        place: '=',
        currentPlaceId: '='
      },
      link: function(scope) {
        // scope.activity.parseData = '';
        // if ( scope.activity.post ) {
        //   if ( scope.activity.post.subject.length > 0 ) {
        //     scope.activity.parseData = scope.activity.post.subject;
        //   } else if ( scope.activity.post.body.length > 0 ) {
        //     scope.activity.parseData = scope.activity.post.body;
        //   } else {
        //     scope.activity.parseData = 'Shared' + ' ' + scope.activity.post.counters.attaches > 1 ? scope.activity.post.counters.attaches : 'one' + scope.activity.post.counters.attaches > 1 ? 'attachments.' : 'attachment.';
        //   }
        // }
        // scope.activity.parseData =

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/messages/partials/activity/member-remove.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/messages/partials/activity/member-join.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/messages/partials/activity/place-add.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/messages/partials/activity/post-add.html';
            break;

          case NST_EVENT_ACTION.POST_ATTACH_PLACE:
            scope.tplUrl = 'app/messages/partials/activity/post-attach-place.html';
            break;

          case NST_EVENT_ACTION.POST_REMOVE_PLACE:
            scope.tplUrl = 'app/messages/partials/activity/post-remove-place.html';
            break;

          case NST_EVENT_ACTION.POST_MOVE:
            scope.tplUrl = 'app/messages/partials/activity/post-move.html';
            break;

          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/messages/partials/activity/comment-add.html';
            break;

          case NST_EVENT_ACTION.COMMENT_REMOVE:
            scope.tplUrl = 'app/messages/partials/activity/comment-remove.html';
            break;

          default:
            scope.tplUrl = '';
            return NstSvcLogger.error(NstUtility.string.format('The event type ({0}) is not supported!', scope.activity.type));
        }
      },
      template: '<div class="row" data-ng-include="tplUrl" data-ng-init="act = activity"></div>'
    };
  }
})();
