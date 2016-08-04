(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentMap', NstSvcCommentMap);

  /** @ngInject */
  function NstSvcCommentMap(NstVmCommentItem) {

    var service = {
      toMessageComment: toMessageComment,
      toPostComment: toPostComment
    };

    return service;

    function toMessageComment(comment) {
      return new NstVmCommentItem(comment);
    }

    function toPostComment(comment) {
      return new NstVmCommentItem(comment, true);
    }
  }
})();
