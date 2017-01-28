(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMessage', NstVmMessage);

  function NstVmMessage(moment, NstPost, NstSvcAttachmentMap, NstSvcCommentMap, NstSvcAuth, NstUtility, NST_PLACE_ACCESS) {

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
      }

      if (post instanceof NstPost) {
        this.id = post.id;
        this.sender = post.sender ?  mapSender(post.sender) :  mapSender(post.emailSender);
        this.subject = post.subject;
        this.body = post.body;
        this.isExternal = !post.internal;
        this.contentType = post.contentType;
        this.date = post.date;
        this.attachments = _.map(post.attachments, NstSvcAttachmentMap.toAttachmentItem);
        this.recipients = post.recipients;
        this.ellipsis = post.ellipsis;
        this.bookmarked = post.bookmarked;

        _.forEach(post.comments, function (comment, index) {
          var model = NstSvcCommentMap.toMessageComment(comment);
          var previousIndex = index - 1;
          if (previousIndex >= 0) {

            var previousComment = post.comments[previousIndex];
            if (previousComment.sender.id === model.sender.username) {
              model.stickedToPrevious = true;
            }
          }

          that.comments.push(model);
        });

        // this.comments = _.map(post.comments, NstSvcCommentMap.toMessageComment);
        this.isReplyed = !!post.replyToId;
        this.isForwarded = !!post.forwardFromId;
        this.commentsCount = post.counters.comments > -1 ? post.counters.comments : 0;
        this.allPlaces = _.map(post.places, mapPlace);
        this.isRead = post.isRead;
        if (post.wipeAccess !== null && post.wipeAccess !== undefined) {
          this.wipeAccess = post.wipeAccess;
        } else {
          this.wipeAccess = post.sender ? post.sender.id === NstSvcAuth.user.id && moment(post.date).isAfter(moment().subtract(24, 'hours')) : false;
        }


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
        avatar: sender.hasPicture() ? sender.picture.getUrl("x64") : ''
      };
    }

    // TODO: Use NstVmPlace instead
    function mapPlace(place) {
      return {
        id: place.id,
        name: place.name,
        picture: place.hasPicture() ? place.picture.getUrl("x128") : '/assets/icons/absents_place.svg',
        hasDeleteAccess: _.includes(place.accesses, NST_PLACE_ACCESS.REMOVE_POST)
      };
    }

  }
})();
