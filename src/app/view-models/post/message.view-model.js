(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMessage', NstVmMessage);

  function NstVmMessage($filter, moment, NstPost, NstSvcAttachmentMap, NstSvcAuth, NstUtility) {

    function VmMessage(post, firstPlaceId, myPlaceIds) {
      var that = this;

      this.id = null;
      this.sender = null;
      this.emailSender = null;
      this.subject = null;
      this.body = null;
      this.isExternal = null;
      this.contentType = null;
      this.date = null;
      this.updatedDate = null;
      this.attachments = [];
      this.comments = [];
      this.bookmarked = null;
      this.isReplyed  = null;
      this.isForwarded = null;
      this.commentsCount = 0;


      this.firstPlace = null;
      this.isRead = null;
      this.wipeAccess = null;
      this.ellipsis = null;

      this.getAllPlacesCount = function () {
        return this.allPlaces.length;
      }

      this.hasAnyAttachment = function () {
        return this.attachments.length > 0;
      }

      this.hasAnyComment = function () {
        return this.commentsCount > 0;
      }

      this.dropPlace = function (placeId) {
        NstUtility.collection.dropById(this.allPlaces, placeId);
        this.firstPlace = _.head(this.allPlaces);
      };

      if (post instanceof NstPost) {

        this.id = post.id;
        this.sender = post.sender ?  mapSender(post.sender) :  mapSender(post.emailSender);
        this.subject = post.subject;
        this.body = post.body;
        this.isExternal = !post.internal;
        this.contentType = post.contentType;
        this.date = post.date;
        this.updatedDate = post.updatedDate;
        this.attachments = _.map(post.attachments, NstSvcAttachmentMap.toAttachmentItem);
        this.recipients = post.recipients;
        this.ellipsis = post.ellipsis;
        this.bookmarked = post.bookmarked;
        this.comments = _.takeRight(post.comments, 3);
        this.isReplyed = !!post.replyToId;
        this.isForwarded = !!post.forwardFromId;
        this.commentsCount = post.counters.comments > -1 ? post.counters.comments : 0;
        this.allPlaces = post.places;
        this.isRead = post.isRead;
        if (post.wipeAccess !== null && post.wipeAccess !== undefined) {
          this.wipeAccess = post.wipeAccess;
        } else {
          this.wipeAccess = post.sender ? post.sender.id === NstSvcAuth.user.id && moment(post.date).isAfter(moment().subtract(24, 'hours')) : false;
        }
        this.getTrustedBody = post.getTrustedBody;


        // Sort places with the priorities listed here:
        // 1. The place with the given Id (My personal place or any from my places list)
        // 2. My places
        // 3. Any other places
        if (_.isArray(myPlaceIds) && myPlaceIds.length > 0) {

          this.allPlaces = _.orderBy(this.allPlaces, [function (place) {
            return [_.includes(myPlaceIds, place.id)];
          }],['desc']);
        }

        // Find the place and put it as the first item of the list
        if (firstPlaceId) {
          var removedItems = _.remove(this.allPlaces, { id : firstPlaceId });
          if (_.isArray(removedItems) && removedItems.length === 1) {
            this.allPlaces.unshift(removedItems[0]);
          }
        }

        this.firstPlace = _.head(this.allPlaces);
      }
    }

    return VmMessage;

    // TODO: Use NstVmUser instead
    function mapSender(sender) {

      if (!sender) {
        return {};
      }

      return {
        name: sender.fullName ? sender.fullName  : sender.id,
        username: sender.id,
        avatar: sender.hasPicture() ? sender.picture.getUrl("x64") : '',
        avatar128: sender.hasPicture() ? sender.picture.getUrl("x128") : ''
      };
    }
  }
})();
