(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstMention', NstMention);

  /** @ngInject */
  function NstMention(NstModel) {
    function Mention(data) {
      this.id = undefined;

      this.commentId = undefined;
      this.comment = undefined;

      this.mentionedId = undefined;
      this.mentioned = undefined;

      this.postId = undefined;
      this.post = undefined;

      this.isSeen = undefined;

      this.senderId = undefined;
      this.sender = undefined;

      this.date = undefined;
    }

    Mention.prototype = new NstModel();
    Mention.prototype.constructor = Mention;

    return Mention;
  }

})();
