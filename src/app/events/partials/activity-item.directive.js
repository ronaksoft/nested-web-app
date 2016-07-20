(function() {
  'use strict';

  angular
    .module('nested')
    .directive('ActivityItem', ActivityItem);

  /** @ngInject */
  function ActivityItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      scope:{
        activity: '=model'
      },
      link: function(scope, elem, attrs) {
        switch (scope.activity.type){
          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/events/partials/event/comment/add.html';
            break;

          case NST_EVENT_ACTION.MEMBER_INVITE:
            scope.tplUrl = 'app/events/partials/event/member/invite.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/events/partials/event/member/join.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/events/partials/event/place/add.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/events/partials/event/post/add.html';
            break;

          case NST_EVENT_ACTION.PLACE_REMOVE:
            scope.tplUrl = 'app/events/partials/event/place/remove.html';
            break;

          default:
            break;
        }
      },
      template: '<div class="evrow _fw _fn" data-ng-include="tplUrl" data-ng-init="act = activity"></div>'
    };
  }

})();
