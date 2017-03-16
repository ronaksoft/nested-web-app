(function() {
  'use strict';

  angular.module('ronak.nested.web.message').factory('NstPostDraft', NstPostDraft);

  function NstPostDraft() {

    function PostDraft() {

      this.subject = null;
      this.body = null;
      this.recipients = null;
      this.attachments = null;

      return this;
    }

    PostDraft.prototype = {};
    PostDraft.prototype.constructor = PostDraft;

    return PostDraft;

  }

})();
