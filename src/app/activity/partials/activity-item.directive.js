(function () {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
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
      link: function (scope, element, attrs) {

        // TODO: Do not modify the view-model here!!
        if (scope.place){
          scope.activity.inSpecificPlace = true;
        }

        switch (scope.activity.type) {
          case NST_EVENT_ACTION.MEMBER_ADD:
            scope.tplUrl = 'app/activity/partials/activity-member-add.html';
            break;

          case NST_EVENT_ACTION.MEMBER_REMOVE:
            scope.tplUrl = 'app/activity/partials/activity-member-remove.html';
            break;

          case NST_EVENT_ACTION.MEMBER_INVITE:
            scope.tplUrl = 'app/activity/partials/activity-member-invite.html';
            break;

          case NST_EVENT_ACTION.MEMBER_JOIN:
            scope.tplUrl = 'app/activity/partials/activity-member-join.html';
            break;

          case NST_EVENT_ACTION.PLACE_ADD:
            scope.tplUrl = 'app/activity/partials/activity-place-add.html';
            break;

          case NST_EVENT_ACTION.PLACE_REMOVE:
            scope.tplUrl = 'app/activity/partials/activity-place-remove.html';
            break;

          case NST_EVENT_ACTION.POST_ADD:
            scope.tplUrl = 'app/activity/partials/activity-post-add.html';
            break;

          case NST_EVENT_ACTION.COMMENT_ADD:
            scope.tplUrl = 'app/activity/partials/activity-comment-add.html';
            break;

          default:
            scope.tplUrl = 'app/activity/partials/activity-default.html';
            break;
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
