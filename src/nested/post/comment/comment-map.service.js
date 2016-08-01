(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentMap', NstSvcCommentMap);

  /** @ngInject */
  function NstSvcCommentMap(NstVmCommentItem) {

    var service = {
      toMessageComment: toMessageComment
    };

    return service;

    function toMessageComment(comment) {
      return new NstVmCommentItem(comment);
    }

  }

})();
