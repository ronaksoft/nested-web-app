(function() {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPost', NstPost);

  function NstPost(_, NST_ATTACHMENT_STATUS, NstTinyPost, NstAttachment) {
    Post.prototype = new NstTinyPost();
    Post.prototype.constructor = Post;

    function Post(model) {
      this.moreComments = false;

      this.body = null;
      // some sort of APIs return post with a trivial body
      this.bodyIsTrivial = false;
      this.contentType = "text/plain";

      /**
       * Post Sender
       *
       * @type {NstUser}
       */
      this.sender = null;

      this.emailSender = null;

      this.date = null;
      this.updatedDate = null;

      /**
       * Post Comments
       *
       * @type {NstComment[]}
       */
      this.comments = [];

      /**
       * Post Recipients
       *
       * @type {NstRecipient[]}
       */
      this.recipients = [];

      this.internal = false;

      // TODO: Use ReplyToId instead
      this.replyTo = null;
      this.replyToId = null;


      // TODO: Use ForwardFromId instead
      this.forwardFrom = null;
      this.forwardFromId = null;

      this.resources = {};

      this.counters = {
        attaches: -1,
        comments: -1,
        replied: -1,
        forwarded: -1,
        size: -1
      };

      // The user is allowed to retract the post (remove from all places)
      // TODO: add this in all parse functions
      this.wipeAccess = null;

      this.isRead = null;

      this.trusted = false;

      this.ellipsis = null;

      this.bookmarked = null;

      NstTinyPost.call(this, model);

      if (model && model.id) {
        this.fill(model);
      }
    }

    /**
     * Post.prototype.removeComment - remove a comment from its post by id
     *
     * @param  {NstComment} comment comment
     * @return {NstPost}            post
     */
    Post.prototype.removeComment = function(comment) {
      var index = _.findIndex(this.comments, {
        'id': comment.id
      });
      this.comments.splice(index, 1);

      return this;
    };

    /**
     * Post.prototype.addAttachment - add an attachment to a post
     *
     * @param  {NstAttachment} attachment attachment
     * @return {NstPost}                  post
     */
    Post.prototype.addAttachment = function(attachment) {
      attachment = attachment instanceof NstAttachment ? attachment : new NstAttachment(attachment, this);
      attachment.post = this;
      this.attachments.push(attachment);

      // this.attachmentPreview = this.attachmentPreview || !!attachment.thumbs.x128.uid;

      return this;
    };

    /**
     * Post.prototype.removeAttachment - remove an attachment from a post attachments list
     *
     * @param  {NstAttachment} attachment attachment
     * @return {NstPost}                  post
     */
    Post.prototype.removeAttachment = function(attachment) {
      var itemIndex = this.attachments.indexOf(attachment);
      if (itemIndex !== -1) {
        this.attachments.splice(itemIndex, 1);
      }

      return this;
    };


    Post.prototype.addComment = function(comment) {
      var index = _.findIndex(this.comments, function (item) {
        return item.id === comment.id;
      });
      if (index === -1) {
        this.comments.push(comment);
        return true;
      }

      return false;
    };

    /**
     * anonymous function - add the comment to the post comments list if it was
     * not added before
     *
     * @param  {NstComment[]} comments an array of comments
     * @return {NstPost}               the post
     */
    Post.prototype.addComments = function(comments) {
      var newComments = _.differenceBy(comments, this.comments, 'id');

      _.forEach(newComments, function(comment) {
        this.addComment(comment);
      }.bind(this));
      return this;
    };

    Post.prototype.belongsToPlace = function (placeId) {
      return _.some(this.places, function (place) {
        return place.id === placeId;
      });
    };

    Post.prototype.addToCommentsCount = function (count) {
      this.counters.comments += count || 0;
    }


    Post.prototype.getTrustedBody = function () {
      var imgRegex = new RegExp('<img(.*?)source=[\'|"](.*?)[\'|"](.*?)>','g');
      var resources = this.resources;
      this.trusted = true;
      var body = this.body.replace(imgRegex,function (m, p1, p2, p3) {
        var src = resources[p2];
        return "<img" +  p1 + "src='" + src + "' " + p3 +">"
      });
      return body;

    };

    return Post;
  }
})();
