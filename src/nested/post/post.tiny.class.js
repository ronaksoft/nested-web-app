(function() {
  'use strict';

  angular.module('nested').factory('NstTinyPost', NstTinyPost);

  function NstTinyPost($q, _, ATTACHMENT_STATUS, NstModel, NstAttachment) {

    TinyPost.prototype = new NstModel();
    TinyPost.prototype.constructor = TinyPost;

    function TinyPost(model) {

      this.id = null;
      this.subject = null;
      this.placeIds = []; // aray of places id
      this.senderId = null; // sender id

      NstModel.call(this, model);

      if (model && model.id) {
        this.fill(model);
      }

    }

    return TinyPost;
  }
})();
