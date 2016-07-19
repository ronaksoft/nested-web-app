(function() {
  'use strict';

  angular
    .module('nested')
    .directive('comment', comment);

  /** @ngInject */
  function comment() {
    return {
      restrict: 'E',
      scope:{},
      link: function(scope, elem, attrs) {
      },
      templateUrl: 'app/messages/partials/message/comment.html',
      controller: 'CommentsBoardController',
      controllerAs: 'ctlComment',
      bindToController: {
        comment: '=cm'
      }
    };
  }

})();
