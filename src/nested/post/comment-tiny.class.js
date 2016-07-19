(function() {
  'use strict';

  angular.module('nested').factory('NstTinyComment', NstTinyComment);

  function NstTinyComment(NstModel) {
    TinyComment.prototype = new NstModel();
    TinyComment.prototype.constructor = TinyComment;

    function TinyComment(model) {

      this.postId = null;
      this.senderId = null;
      this.sender = null;
      this.id = null;
      this.body = null;
      this.date = null;

      NstModel.call(this, model);

      if (model && model.id) {
        this.fill(this, model);
      }
    }

    return TinyComment;
  }
})();
