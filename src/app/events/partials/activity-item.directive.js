(function () {
  'use strict';

  angular
    .module('nested')
    .directive('activityItem', ActivityItem);

  /** @ngInject */
  function ActivityItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      transclude : true,
      scope: {
        activity: '=model',
        extended: '=extended',
        place: '=place'
      },
      link: function (scope, elem, attrs) {

        // TODO: Do not modify the view-model here!!
        if (scope.place){
          scope.activity.inSpecificPlace = true;
        }

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_ADD:
            scope.tplUrl = 'app/events/partials/activity-member-add.html';
            break;

          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/events/partials/activity-member-remove.html';
            break;

          case NST_EVENT_ACTION.MEMBER_INVITE:
            scope.tplUrl = 'app/events/partials/activity-member-invite.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/events/partials/activity-member-join.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/events/partials/activity-place-add.html';
            break;

          case NST_EVENT_ACTION.PLACE_REMOVE:
            scope.tplUrl = 'app/events/partials/activity-place-remove.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/events/partials/activity-post-add.html';
            break;

          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/events/partials/activity-comment-add.html';
            break;

          default:
            scope.tplUrl = 'app/events/partials/activity-default.html';
            break;
        }
      },
      template: '<div class="evrow _fw _fn use-ng-animate" ng-class="{ hot : activity.isHot }" data-ng-include="tplUrl" data-ng-init="act = activity;extended = extended"></div>'
    };
  }

})();
