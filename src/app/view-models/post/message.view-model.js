(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmMessage', NstVmMessage);

  function NstVmMessage(NstPost, NstSvcAttachmentMap, NstSvcCommentMap, NstSvcAuth) {

    function VmMessage(post, firstPlaceId, myPlaceIds) {

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

      this.firstPlace = null;

      this.getAllPlacesCount = function () {
        return this.allPlaces.length;
      }

      this.hasAnyAttachment = function () {
        return this.attachments.length > 0;
      }

      this.hasAnyComment = function () {
        return this.commentsCount > 0;
      }

      this.getFirstPlace = function () {
        return _.head(this.allPlaces);
      }


      if (post instanceof NstPost) {
        this.id = post.id;
        this.sender = mapSender(post.sender);
        this.subject = post.subject;
        this.body = post.body;
        this.isExternal = !post.internal;
        this.contentType = post.contentType;
        this.date = post.date;
        this.attachments = _.map(post.attachments, NstSvcAttachmentMap.toAttachmentItem);
        this.comments = _.map(post.comments, NstSvcCommentMap.toMessageComment);
        this.isReplyed = !!post.replyToId;
        this.isForwarded = !!post.forwardFromId;
        this.commentsCount = post.counters.comments > -1 ? post.counters.comments : 0;
        this.allPlaces = _.map(post.places, mapPlace);

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
      }
    }

    return VmMessage;

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
        picture: place.getPicture().getThumbnail(64).getUrl().view || '/assets/icons/absents_place.svg'
      };
    }
  }
})();
