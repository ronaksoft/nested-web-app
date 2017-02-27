(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmPost', NstVmPost);

  function NstVmPost($sce, NstPost, NstVmUser, NstSvcAttachmentMap, NstUtility, NstSvcPlaceMap) {

    function VmPost(model) {
      this.id = null;
      this.sender = null;
      this.subject = null;
      this.body = null;
      this.isExternal = null;
      this.contentType = null;
      this.firstPlace = null;
      this.allPlaces = [];
      this.otherPlacesCount = 0;
      this.allPlacesCount = 0;
      this.date = null;
      this.attachments = [];
      this.hasAnyAttachment = null;
      this.comments = [];
      this.hasAnyComment = null;
      this.commentsCount = 0;
      this.isReplyed  = null;
      this.isForwarded  = null;
      this.isRead  = null;
      this.wipeAccess  = null;

      if (model instanceof NstPost) {
        this.id = model.id;
        this.sender = new NstVmUser(model.sender);
        this.subject = model.subject;

        if (model.contentType === 'text/plain') {
          //Convert Plain-text to the Html
          this.body = model.body.replace(/\t/g, '    ')
            .replace(/  /g, '&nbsp; ')
            .replace(/  /g, ' &nbsp;') // second pass
            // handles odd number of spaces, where we
            // end up with "&nbsp;" + " " + " "
            .replace(/\r\n|\n|\r/g, '<br />');
        } else {
          this.body = model.body;
        }
        this.body = $sce.trustAsHtml(data.body);
        this.isExternal = !model.internal;
        this.contentType = model.contentType;
        this.allPlaces = _.map(model.places, function (place) {
          return NstSvcPlaceMap.toBadge(place, 64);
        });
        this.firstPlace = _.head(this.allPlaces);
        this.allPlacesCount = this.allPlaces.length;
        this.otherPlacesCount = this.allPlacesCount - 1;
        this.date = model.date;
        this.attachments = _.map(model.attachments, NstSvcAttachmentMap.toAttachmentItem);
        this.hasAnyAttachment = model.attachments.length > 0;
        this.comments = model.comments;
        this.hasAnyComment = model.comments.length > 0;
        this.commentsCount = model.counters.comments > -1 ? model.counters.comments : 0;
        this.isReplyed = !!model.replyToId;
        this.isForwarded = !!model.forwardFromId;
        this.isRead = model.isRead;
        this.wipeAccess = model.wipeAccess;
      }
    }

    VmPost.prototype.hasSubject = function () {
      return _.isString(this.subject) && this.subject.length > 0;
    }

    VmPost.prototype.dropPlace = function (placeId) {
      NstUtility.collection.dropById(this.allPlaces, placeId);
      this.firstPlace = _.head(this.allPlaces);
      this.allPlacesCount = this.allPlaces.length;
      this.otherPlacesCount = this.allPlacesCount > 0 ? this.allPlacesCount - 1 : 0;
    }

    return VmPost;

  }
})();
