(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('postCard', PostItem);

  /** @ngInject */
  function PostItem() {
    return {
      restrict: 'E',
      scope: {},
      link: function () {
      },
      templateUrl: 'app/messages/partials/message/post-card.html',
      controller: 'PostCardController',
      controllerAs: 'ctlPostCard',
      bindToController: {
        post: '=post',
        mood: '@mood',
        viewSetting: '=settings',
        thisPlace: '=postinplace',
        hasRemoveAccess: '=',
        hasControlAccess: '=',
        isRibbon: '=',
        addOn: '=',
        loading: '=',
        commentBoard: '=',
        ribbonEnabled: '=',
        FIT: '=firstInteractiveTime',
      }
    };
  }

})();
