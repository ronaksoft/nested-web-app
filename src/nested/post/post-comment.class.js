(function() {
  'use strict';

  angular.module('nested').factory('NstComment', NstComment);

  function NstComment(NstObsModel) {
    Comment.prototype = new NstObsModel();
    Comment.prototype.constructor = Comment;
    
    function Comment(model) {

      this.post = null;
      this.id = null;
      this.body = null;
      this.date = null;
      this.attach = null;
      this.contentType = "text/plain";
      this.sender = null;
      this.removed = false;

      if (model && model.id) {
        angular.extend(this, model);
      }
    }

    return Comment;
  }

})();
