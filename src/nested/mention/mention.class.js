(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstMention', NstMention);

  /** @ngInject */
  function NstMention() {
    function Mention() {
      this.id = null;

      this.commentId = null;
      this.comment = null;

      this.mentionedId = null;
      this.mentioned = null;

      this.postId = null;
      this.post = null;

      this.isSeen = null;

      this.senderId = null;
      this.sender = null;

      this.date = null;

      this.seen = null;
    }

    Mention.prototype = {};
    Mention.prototype.constructor = Mention;

    return Mention;
  }

})();
