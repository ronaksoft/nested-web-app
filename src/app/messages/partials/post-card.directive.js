(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('postCard', PostItem);

  /** @ngInject */
  function PostItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      scope:{},
      link: function(scope, elem, attrs) {},
      templateUrl: 'app/messages/partials/message/post-card.html',
      controller: 'PostCardController',
      controllerAs: 'ctlPostCard',
      bindToController: {
        post: '=post',
        mood: '@mood',
        viewSetting: '=settings',
        thisPlace: '=postinplace',
        hasRemoveAccess:'=hasRemoveAccess',
        hasControlAccess: '=',
        isRibbon: '=',
        addOn: '=',
        commentBoard: '=',
        ribbonEnabled : '='
      }
    };
  }

})();
