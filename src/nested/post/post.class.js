(function() {
  'use strict';

  angular.module('nested').factory('NstPost', NstPost);

  function NstPost($rootScope, $q, $injector, $log, _, WsService, NstObsModel, NestedUser, NestedPlace, NestedAttachment, NestedRecipient, ATTACHMENT_STATUS) {

    Post.prototype = new NstObsModel();
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
    }

    Post.prototype.create = function(data) {
      this.id = data._id.$oid;
      this.sender = new NestedUser(data.sender);
      this.replyTo = new Post(data.replyTo);
      this.subject = data.subject;
      this.contentType = data.content_type;
      this.body = data.body;
      this.internal = data.internal;
      this.date = new Date(data['time-stamp'] * 1e3);
      this.updated = new Date(data['last-update'] * 1e3);
      this.counters = data.counters || this.counters;
      this.moreComments = this.counters.comments > -1 ? this.counters.comments > this.comments.length : true;
      this.monitored = data.monitored;
      this.forwarded = new Post(data.forwarded);
      this.spam = data.spam;

      this.places = [];
      for (var k in data.post_places) {
        this.places[k] = new NestedPlace({
          id: data.post_places[k]._id,
          name: data.post_places[k].name
        });
      }

      if (data.place_access) {
        _.forEach(this.places, function(place) {
          place.access = _.find(data.place_access, {
            '_id': place.id
          }).access;
        });
      }

      this.attachments = [];
      this.attachmentPreview = false;
      for (var k in data.post_attachments) {
        this.attachments[k] = new NestedAttachment(data.post_attachments[k], this);
        this.attachmentPreview = this.attachmentPreview || !!this.attachments[k].thumbs.x128.uid;
      }

      this.recipients = []; // TODO: ?
      for (var k in data.recipients) {
        this.recipients[k] = new NestedRecipient(data.recipients[k]);
      }

      if (this.full) {
        this.commentLimit = this.counters.comments || 100 * this.commentLimit;
        this.loadComments();
      }

      return this;
    };

    Post.prototype.removeComment = function(comment) {
      var index = _.findIndex(this.comments, { 'id': comment.id });
      this.comments.splice(index, 1);
    };

    Post.prototype.addAttachment = function(attachment) {
      attachment = attachment instanceof NestedAttachment ? attachment : new NestedAttachment(attachment, this);
      attachment.post = this;
      this.attachments.push(attachment);

      this.attachmentPreview = this.attachmentPreview || !!attachment.thumbs.x128.uid;
    };

    Post.prototype.removeAttachment = function(attachment) {
      var itemIndex = this.attachments.indexOf(attachment);
      if (itemIndex !== -1) {
        this.attachments.splice(itemIndex, 1);
      }
    };

    Post.prototype.getPlacesHaveDeleteAccess = function(post) {
      return getPlacesWithAccess(post, 'RM');
    };

    Post.prototype.haveAnyPlaceWithDeleteAccess = function() {
      return filterPlacesByAccessCode(this.places, ['RM']).length > 0;
    };

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

    Post.prototype.hasAnyUploadInProgress = function() {
      return _.some(this.attachments, function(attach) {
        return attach.status === ATTACHMENT_STATUS.UPLOADING;
      });
    };

    Post.prototype.addComments = function (comments) {
      var newComments = _.differenceBy(comments, this.comments, 'id');

      _.forEach(newComments, function (comment) {
        this.comments.unshift(comment);
      }.bind(this));
    };

    return Post;

    function loadPlacesWithAccess(ids) {
      return WsService.request('place/get_access', {
        place_ids: ids
      });
    }

    function getPlacesWithAccess(post, accessCodes) {
      var separator = ',';
      var codes = _.split(accessCodes, separator);

      return $q(function(resolve, reject) {
        resolve(filterPlacesByAccessCode(post.places, codes));
      });
    }

    function getAllPlacesIds(post) {
      return _.join(_.map(post.places, 'id'), ',');
    }

    function filterPlacesByAccessCode(places, accessCodes) {
      return _.filter(places, function(place) {
        return _.intersection(place.access, accessCodes).length > 0; //do the codes exists in access array?
      });
    }

    function fillAccess(post, places) { //fills the post's places access
      for (var i = 0; i < post.places.length; i++) {
        post.places[i].access = _.find(places, {
          '_id': post.places[i].id
        }).access;
      }
    }
  }

})();
