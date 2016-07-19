(function() {
  'use strict';

  angular
    .module('nested')
    .directive('postCard', PostItem);

  /** @ngInject */
  function PostItem(NST_EVENT_ACTION) {
    return {
      restrict: 'E',
      scope:{},
      link: function(scope, elem, attrs) {
      },
      templateUrl: 'app/messages/partials/message/post-card.html',
      controller: 'PostCardController',
      controllerAs: 'ctlPost',
      bindToController: {
        post: '=post',
        viewSetting: '=settings'
      }
    };
  }

})();
