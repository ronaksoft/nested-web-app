(function() {
  'use strict';

  angular.module('nested').factory('NstPost', NstPost);

  function NstPost(_, ATTACHMENT_STATUS, NstModel, NestedAttachment) {

    Post.prototype = new NstModel();
    Post.prototype.constructor = Post;

    function Post(model) {
      this.commentLimit = 30;
      this.moreComments = false;

      this.id = null;
      this.subject = null;
      this.body = null;
      this.contentType = "text/plain";
      this.sender = null; // <NestedUser>
      this.replyTo = null;
      this.date = null;
      this.updated = null;
      this.attachments = []; // [<NestedAttachment>]
      this.attachmentPreview = false;
      this.comments = []; // [<NstComment>]
      this.places = []; // [<NstPlace>]
      this.recipients = []; // [<NestedRecipients>]
      this.spam = 0;
      this.monitored = false;
      this.internal = false;
      this.forwarded = null;
      this.counters = {
        attaches: -1,
        comments: -1,
        replied: -1,
        forwarded: -1,
        size: -1
      };

      if (model && model.id) {
        angular.extend(this, model);
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
        attachment = attachment instanceof NestedAttachment ? attachment : new NestedAttachment(attachment, this);
        attachment.post = this;
        this.attachments.push(attachment);

        this.attachmentPreview = this.attachmentPreview || !!attachment.thumbs.x128.uid;

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

      /**
       * Post.prototype.getPlacesHaveDeleteAccess - Filter places with remove access (RM)
       *
       * @param  {NstPost}      post  post
       * @return {NstPlace[]}         a list of places with remove access
       */
      Post.prototype.getPlacesHaveDeleteAccess = function(post) {
        return getPlacesWithAccess(post, 'RM');
      };

      /**
       * Post.prototype.haveAnyPlaceWithDeleteAccess - check if there is any place
       * with remove access (RM) or not
       *
       * @return {boolean}  return true if there is any place with remove access
       */
      Post.prototype.haveAnyPlaceWithDeleteAccess = function() {
        return filterPlacesByAccessCode(this.places, ['RM']).length > 0;
      };


      /**
       * Post.prototype.getTotalAttachProgress - calculate the amount of bytes were
       * sent to server and report the total progress in percentage
       *
       * @return {Number}  total progress in percentage
       */
      Post.prototype.getTotalAttachProgress = function() {
        var items = _.filter(this.attachments, function(attach) {
          return status !== ATTACHMENT_STATUS.ABORTED;
        });

        if (items.length === 0) {
          return 0;
        }

        var value = (_.sumBy(items, 'loadedSize') / _.sumBy(items, 'size'));

        if (value > 1) { //somethimes total progress value goes beyound 100!!
          return 100;
        }

        return Math.round(value * 100);
      };

      /**
       * Post.prototype.hasAnyUploadInProgress - check if any upload wether is in
       * progress or not
       *
       * @return {boolean}  true if any upload is in progress
       */
      Post.prototype.hasAnyUploadInProgress = function() {
        return _.some(this.attachments, function(attach) {
          return attach.status === ATTACHMENT_STATUS.UPLOADING;
        });
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
          this.comments.push(comment);
        }.bind(this));

        return this;
      };

    }

    return Post;

    function getPlacesWithAccess(post, accessCodes) {
      var separator = ',';
      var codes = _.split(accessCodes, separator);

      return $q(function(resolve, reject) {
        resolve(filterPlacesByAccessCode(post.places, codes));
      });
    }

    function filterPlacesByAccessCode(places, accessCodes) {
      return _.filter(places, function(place) {
        return _.intersection(place.access, accessCodes).length > 0; //do the codes exist in access array?
      });
    }
  }
})();
