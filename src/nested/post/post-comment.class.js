(function() {
  'use strict';

  angular.module('nested').factory('NstComment', NstComment);

  function NstComment($rootScope, $q, $log, WsService, NestedUser, NstPlace, NstPost) {
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

    Comment.prototype = {
      create: function (post, data) {
        this.id = data._id.$oid;
        this.attach = data.attach;
        this.post = post;
        this.sender = new NestedUser({
          _id: data.sender_id,
          fname: data.sender_fname,
          lname: data.sender_lname,
          picture: data.sender_picture
        });
        this.body = data.text;
        this.date = new Date(data.time * 1e3);
        this.removed = data._removed;

        return this;
      }

    };

    return Comment;
  }

})();
