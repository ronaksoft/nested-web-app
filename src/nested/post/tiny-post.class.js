(function() {
  'use strict';

  angular.module('ronak.nested.web.messages').factory('NstTinyPost', NstTinyPost);

  function NstTinyPost($q, _, ATTACHMENT_STATUS, NstModel, NstAttachment) {

    TinyPost.prototype = new NstModel();
    TinyPost.prototype.constructor = TinyPost;

    function TinyPost(model) {

      this.id = null;
      this.subject = null;
      this.senderId = null; // sender id

      /**
       * Post Places
       *
       * @type {NstPlace[]}
       */
      this.places = [];

      /**
       * Post Attachments
       *
       * @type {NstAttachment[]}
       */
      this.attachments = [];

      NstModel.call(this, model);

      if (model && model.id) {
        this.fill(model);
      }
    }

    return TinyPost;
  }
})();
