(function() {
  'use strict';

  angular.module('ronak.nested.web.models')
  .factory('NstComment', NstComment);

  function NstComment() {
    Comment.prototype = {};
    Comment.prototype.constructor = Comment;

    function Comment() {
      this.id = undefined;
      this.body = undefined;
      this.timestamp = undefined;
      this.senderId = undefined;
      this.sender = undefined;
      this.removedById = undefined;
      this.removedBy = undefined;
      this.removed = undefined;
    }

    return Comment;
  }
})();
