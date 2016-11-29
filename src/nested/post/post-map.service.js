(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostMap', NstSvcPostMap);

  /** @ngInject */
  function NstSvcPostMap($q, $log,
    NST_PLACE_MEMBER_TYPE,
    NstSvcAuth, NstSvcPlaceFactory, NstSvcCommentMap, NstSvcAttachmentMap,
    NstVmMessage, NstVmMessageSearchItem) {

    var service = {
      toMessage: toMessage,
      toPost: toPost,
      toSearchMessageItem : toSearchMessageItem
    };

    return service;

    /*****************************
     *****  Implementations   ****
     *****************************/

    function toMessage(post, firstPlaceId, myPlaceIds) {
      return new NstVmMessage(post, firstPlaceId, myPlaceIds);
    }

    function toPost(post) {
      var postPlaces = post.places;
      var firstPlace = _.first(postPlaces);

      if (post.contentType === 'text/plain'){
        //Convert Plain-text to the Html
        post.body = post.body.replace(/\t/g, '    ')
          .replace(/  /g, '&nbsp; ')
          .replace(/  /g, ' &nbsp;') // second pass
          // handles odd number of spaces, where we
          // end up with "&nbsp;" + " " + " "
          .replace(/\r\n|\n|\r/g, '<br />');
      }
      return {
        id: post.id,
        sender: mapSender(post.sender),
        subject: post.subject,
        body: post.body,
        isExternal: !post.internal,
        contentType: post.contentType,
        firstPlace: firstPlace ? mapPlace(firstPlace) : undefined,
        allPlaces: _.map(postPlaces, mapPlace),
        otherPlacesCount: postPlaces.length - 1,
        allPlacesCount: postPlaces.length,
        date: post.date,
        attachments: _.map(post.attachments, NstSvcAttachmentMap.toAttachmentItem),
        hasAnyAttachment: post.attachments.length > 0,
        comments: _.map(post.comments, mapComment),
        hasAnyComment: post.comments.length > 0,
        commentsCount: post.counters.comments > -1 ? post.counters.comments : 0,
        isReplyed : !!post.replyToId,
        isForwarded : !!post.forwardFromId,
        isRead : post.isRead,
        wipeAccess : post.wipeAccess
      };

      /*****************************
       *****   MSG Map Methods  ****
       *****************************/

      function mapComment(comment) {
        return NstSvcCommentMap.toPostComment(comment);
      }
    }

    function toSearchMessageItem(post) {
      return new NstVmMessageSearchItem(post);
    }
    /*****************************
     ***** Intern Map Methods ****
     *****************************/

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
        picture: place.picture.id ? place.getPicture().getThumbnail(64).getUrl().view : '/assets/icons/absents_place.svg'
      };
    }

  }

})();
