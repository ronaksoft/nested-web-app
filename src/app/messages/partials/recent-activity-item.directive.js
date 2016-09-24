(function() {
  'use strict';

  angular
    .module('nested')
    .directive('recentActivityItem', RecentActivityItem);

  /**
   * switch template of each activity in messages page
   */
  function RecentActivityItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      replace: true,
      scope:{
        activity: '=model',
        place : '=place'
      },
      link: function(scope) {

        if (scope.place){
          scope.activity.inSpecificPlace = true;
        }

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_ADD:
            scope.tplUrl = 'app/messages/partials/activity/member-add-row.html';
            break;
          
          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/messages/partials/activity/member-remove-row.html';
            break;
          
          case NST_EVENT_ACTION.MEMBER_INVITE:
            scope.tplUrl = 'app/messages/partials/activity/invite-row.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/messages/partials/activity/join-row.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/messages/partials/activity/place-add-row.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/messages/partials/activity/post-row.html';
            break;

          case NST_EVENT_ACTION.PLACE_REMOVE:
            scope.tplUrl = 'app/messages/partials/activity/remove-row.html';
            break;

          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/messages/partials/activity/comment-row.html';
            break;

          default:
            scope.tplUrl = 'app/messages/partials/activity/default.html';
            break;
        }
      },
      template: '<div class="row" data-ng-include="tplUrl" data-ng-init="act = activity"></div>'
    };
  }
})();
