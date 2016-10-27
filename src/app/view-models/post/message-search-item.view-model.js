(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMessageSearchItem', NstVmMessageSearchItem);

  function NstVmMessageSearchItem(NstPost, NstSvcAttachmentMap, NstSvcCommentMap, NstSvcAuth) {

    function VmMessageSearchItem(post) {

      this.id = null;
      this.sender = null;
      this.subject = null;
      this.body = null;
      this.isExternal = null;
      this.contentType = null;
      this.date = null;
      this.attachments = [];
      this.comments = [];
      this.isReplyed  = null;
      this.isForwarded = null;
      this.commentsCount = 0;
      this.isRead = null;

      this.getFirstPlace = function () {
        return _.first(this.getOtherPlaces());
      }

      this.getOtherPlacesCount = function () {
        return this.getOtherPlaces().length;
      }

      this.getOtherPlaces = function () {
        return _.reject(this.allPlaces, { id : NstSvcAuth.user.id });
      }

      this.getAllPlacesCount = function () {
        return this.allPlaces.length;
      }

      this.hasAnyAttachment = function () {
        return this.attachments.length > 0;
      }

      this.hasAnyComment = function () {
        return this.commentsCount > 0;
      }


      if (post instanceof NstPost) {
        this.id = post.id;
        this.sender = mapSender(post.sender);
        this.subject = post.subject;
        this.body = post.body;
        this.isExternal = !post.internal;
        this.contentType = post.contentType;
        this.allPlaces = _.map(post.places, mapPlace);
        this.date = post.date;
        this.attachments = _.map(post.attachments, NstSvcAttachmentMap.toAttachmentItem);
        this.isReplyed = !!post.replyToId;
        this.isForwarded = !!post.forwardFromId;
        this.commentsCount = post.counters.comments > -1 ? post.counters.comments : 0;
        this.isRead = post.isRead;
      }
    }

    return VmMessageSearchItem;

    // TODO: Use NstVmUser instead
    function mapSender(sender) {
      if (!sender) {
        return {};
      }

      return {
        name: sender.fullName,
        username: sender.id,
        avatar: sender.getPicture().getThumbnail(32).getUrl().view
      };
    }

    // TODO: Use NstVmPlace instead
    function mapPlace(place) {
      return {
        id: place.id,
        name: place.name,
        picture: place.getPicture().getThumbnail(64).getUrl().view
      };
    }
  }
})();
