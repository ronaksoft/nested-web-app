(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostMap', NstSvcPostMap);

  /** @ngInject */
  function NstSvcPostMap($q, $log, NST_PLACE_MEMBER_TYPE, NstSvcAuth, NstSvcPlaceFactory, NstSvcCommentMap, NstSvcAttachmentMap) {

    var service = {
      toMessage: toMessage,
      toPost: toPost
    };

    return service;

    /*****************************
     *****  Implementations   ****
     *****************************/

    function toMessage(post) {
      var now = moment();

      var senderPlaceId = post.sender.id;
      var postPlaces = post.places.filter(function (v) { return senderPlaceId != v.id; });
      var firstPlace = _.first(postPlaces);

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
        isReplyed : !!post.replyTo,
        isForwarded : !!post.forwardFrom
        // userHasRemoveAccess : post.haveAnyPlaceWithDeleteAccess()
      };

      /*****************************
       *****   MSG Map Methods  ****
       *****************************/

      function mapComment(comment) {
        return NstSvcCommentMap.toMessageComment(comment);
      }
    }

    function toPost(post) {
      var postPlaces = post.places;
      var firstPlace = _.first(postPlaces);

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
        isReplyed : !!post.replyTo,
        isForwarded : !!post.forwardFrom
        // userHasRemoveAccess : post.haveAnyPlaceWithDeleteAccess()
      };

      /*****************************
       *****   MSG Map Methods  ****
       *****************************/

      function mapComment(comment) {
        return NstSvcCommentMap.toPostComment(comment);
      }
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
        picture: place.getPicture().getThumbnail(64).getUrl().view
      };
    }

    /*****************************
     *****    Aux Methods     ****
     *****************************/

    function sortPlaces(postPlaces) {
      return $q.all(postPlaces.map(function (place) {
        return NstSvcPlaceFactory.isInMyPlaces(place.id).then(function (result) {
          return $q(function (res) {
            res({
              place: place,
              isMine: result
            });
          });
        });
      })).then(function (trustedPlaces) {
        // $log.debug('Post Map | Post\'s trusted places: ', trustedPlaces);

        trustedPlaces = trustedPlaces.sort(function (trustedPlace1, trustedPlace2) {
          return trustedPlace2.isMine;
        });
        var myTrustedPlaces = trustedPlaces.filter(function (trustedPlace) {
          return trustedPlace.isMine;
        });
        var othersTrustedPlaces = trustedPlaces.filter(function (trustedPlace) {
          return !trustedPlace.isMine;
        });

        return $q.all(myTrustedPlaces.map(function (trustedPlace) {
          return NstSvcPlaceFactory.getRoleOnPlace(trustedPlace.place.id).then(function (role) {
            return $q(function (res) {
              res({
                place: trustedPlace.place,
                myRole: role,
                isMine: trustedPlace.isMine
              });
            });
          });
        })).then(function (myTrustedRoledPlaces) {
          return $q(function (res) {
            res(myTrustedRoledPlaces.concat(othersTrustedPlaces));
          });
        });
      }).then(function (trustedRoledPlaces) {
        // $log.debug('Post Map | Post\'s trusted roled places: ', trustedRoledPlaces);

        trustedRoledPlaces = trustedRoledPlaces.sort(function (trustedRoledPlace1, trustedRoledPlace2) {
          return trustedRoledPlace2.myRole > trustedRoledPlace1.myRole;
        });

        var othersTrustedRoledPlaces = trustedRoledPlaces.filter(function (trustedRoledPlace) {
          return !trustedRoledPlace.isMine;
        });

        var myTrustedRoledPlaces = trustedRoledPlaces.filter(function (trustedRoledPlace) {
          return trustedRoledPlace.isMine;
        });

        var myTrustedCreatorPlaces = myTrustedRoledPlaces.filter(function (trustedRoledPlace) {
          return NST_PLACE_MEMBER_TYPE.CREATOR == trustedRoledPlace.myRole;
        });

        var myTrustedKeyHolderPlaces = myTrustedRoledPlaces.filter(function (trustedRoledPlace) {
          return NST_PLACE_MEMBER_TYPE.KEY_HOLDER == trustedRoledPlace.myRole;
        });

        var myTrustedKnownGuestPlaces = myTrustedRoledPlaces.filter(function (trustedRoledPlace) {
          return NST_PLACE_MEMBER_TYPE.KNOWN_GUEST == trustedRoledPlace.myRole;
        });

        return $q(function (res) {
          res(myTrustedCreatorPlaces.concat(myTrustedKeyHolderPlaces).concat(myTrustedKnownGuestPlaces).concat(othersTrustedRoledPlaces));
        })
      }).then(function (postSortedPlaces) {
        $log.debug('Post Map | Post\'s sorted places: ', postSortedPlaces);

        return $q(function (res) {
          res(postSortedPlaces);
        });
      });
    }

  }

})();
