(function () {
  'use strict';

  angular
    .module('nested')
    .directive('activityItem', ActivityItem);

  /** @ngInject */
  function ActivityItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      scope: {
        activity: '=model',
        extended: '=extended',
        place: '=place'
      },
      link: function (scope, elem, attrs) {

        if (scope.place){
          scope.activity.inSpecificPlace = true;
        }

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_ADD:
            scope.tplUrl = 'app/events/partials/event/member/add.html';
            break;
          
          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/events/partials/event/member/remove.html';
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

          case NST_EVENT_ACTION.PLACE_REMOVE:
            scope.tplUrl = 'app/events/partials/event/place/remove.html';
            break;
          
          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/events/partials/event/post/add.html';
            break;
          
          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/events/partials/event/comment/add.html';
            break;

          default:
            scope.tplUrl = 'app/events/partials/event/default.html';
            break;
        } 
      },
      template: '<div class="evrow _fw _fn" data-ng-include="tplUrl" data-ng-init="act = activity;extended = extended"></div>'
    };
  }

})();
