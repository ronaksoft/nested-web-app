(function() {
  'use strict';

  angular.module('ronak.nested.web.models')
  .factory('NstComment', NstComment);

  function NstComment() {
    Comment.prototype = {};
    Comment.prototype.constructor = Comment;

    function Comment(model) {
      this.id = null;
      this.body = null;
      this.date = null;
      this.senderId = null;
      this.sender = null;
      this.postId = null;
      this.post = null;
      this.attach = null;
      this.contentType = "text/plain";
      this.removed = false;
    }

    return Comment;
  }
})();
