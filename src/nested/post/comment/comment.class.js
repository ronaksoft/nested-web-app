(function() {
  'use strict';

  angular.module('ronak.nested.web.models')
  .factory('NstComment', NstComment);

  function NstComment(NstTinyComment) {
    Comment.prototype = new NstTinyComment();
    Comment.prototype.constructor = Comment;

    function Comment(model) {

      this.post = null;
      this.date = null;
      this.attach = null;
      this.contentType = "text/plain";
      this.sender = null;
      this.removed = false;

      NstTinyComment.call(this, model);

      if (model && model.id) {
        this.fill(this, model);
      }
    }

    return Comment;
  }
})();
