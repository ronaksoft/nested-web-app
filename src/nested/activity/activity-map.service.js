(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityMap', NstSvcActivityMap);

  /** @ngInject */
  function NstSvcActivityMap(NstSvcAttachmentMap, moment) {

    var service = {
      toRecentActivity: toRecentActivity,
      toActivityItems: toActivityItems,
      toActivityItem : toActivityItem
    };

    return service;

    function toRecentActivity(activity) {
      return {
        id: activity.id,
        actor: mapActivityActor(activity),
        member: mapActivityMember(activity),
        comment: mapActivityComment(activity),
        post: mapActivityPost(activity),
        date: activity.date,
        type: activity.type,
        place: mapActivityPlace(activity.place)
      };

      function mapActivityMember(activity) {
        if (!activity.member) {
          return {};
        }
        return {
          id: activity.member.id,
          name: activity.member.fullName,
          type: activity.member.type
        };
      }

      function mapActivityComment(activity) {
        if (!activity.comment) {
          return {};
        }

        return {
          id: activity.comment.id,
          body: activity.comment.body
        };
      }

      function mapActivityPost(activity) {
        if (!activity.post) {
          return {};
        }
        return {
          id: activity.post.id,
          subject: activity.post.subject,
          body: activity.post.body
        };
      }

      function mapActivityActor(activity) {
        return {
          id: activity.actor.id,
          avatar: activity.actor.picture.id ? activity.actor.picture.thumbnails.x32.url.download : null,
          fullname: activity.actor.getFullName(),
          name: activity.actor.firstName
        };
      }

      function mapActivityPlace(place) {
        if (!activity.place || !activity.place.id) {
          return {};
        }

        return {
          id: activity.place.id,
          name: activity.place.name,
          hasParent: !!activity.place.parent,
          parent: mapParentPlace(activity)
        };
      }

      function mapParentPlace(activity) {
        if (!activity.place || !activity.place.parent) {
          return {};
        }

        var parentPlace = {
          id: activity.place.getParent().getId(),
          name: activity.place.getParent().getName(),
        };

        return parentPlace;
      }

    }


    /**
     * mapActivities - map a list of activities to a hierarchal form by date
     *
     * @param  {NstActivity}  acts   a flat list of activities
     * @return {Object}              a hierarchal form of activities
     */
    function toActivityItems(acts) {
      var todayStart = moment().startOf('day');
      var thisMonthStart = moment().startOf('month');
      var thisYearStart =  moment().startOf('year');

      return _.chain(acts).groupBy(function (activity) {
        if (!moment.isMoment(activity.date)){
          activity.date = moment(activity.date);
        }

        if (activity.date.isAfter(todayStart)) {
          return "Today";
        } else if (activity.date.isAfter(thisMonthStart)) {
          return activity.date.clone().startOf('day').format("DD MMM");
        } else if (activity.date.isAfter(thisYearStart)) {
          return activity.date.clone().startOf('month').format("MMM YYYY");
        } else {
          return activity.date.clone().startOf('year').format("YYYY");
        }
      }).map(function (activities, date) {
        return {
          date : date,
          items : _.map(activities, toActivityItem)
        };
      }).value();
    }

    function mapActivityMember(activity) {
      if (!activity.member || !activity.member.id) {
        return {};
      }
      return {
        id: activity.member.id,
        name: activity.member.fullName,
        type: activity.member.type
      };
    }

    function mapActivityComment(activity) {
      if (!activity.comment || !activity.comment.id) {
        return {};
      }

      return {
        id: activity.comment.id,
        body: activity.comment.body,
        postId: activity.comment.getPostId()
      };
    }

    function mapActivityPost(activity) {
      if (!activity.post || !activity.post.id) {
        return {};
      }
      var firstPlace = _.first(activity.post.places);
      return {
        id: activity.post.id,
        subject: activity.post.subject,
        body: activity.post.body,
        attachments: _.map(activity.post.attachments, NstSvcAttachmentMap.toAttachmentItem),
        hasAnyAttachment: activity.post.attachments ? activity.post.attachments.length > 0 : false,
        firstPlace: mapPostPlace(firstPlace),
        allPlaces: _.map(activity.post.places, mapPostPlace),
        otherPlacesCount: activity.post.places.length - 1,
        allPlacesCount: activity.post.places.length
      };
    }

    function mapActivityActor(activity) {
      return {
        id: activity.actor.id,
        avatar: activity.actor.picture.thumbnails.x32.url.download,
        name: activity.actor.fullName
      };
    }

    function mapPostPlace(place) {
      if (!place || !place.id) {
        return {};
      }

      return {
        id: place.id,
        name: place.name
        //picture : place.picture.thumbnails.x128.url.download
      };
    }

    function mapActivityPlace(activity) {
      if (!activity.place || !activity.place.id) {
        return {};
      }

      return {
        id: activity.place.id,
        name: activity.place.name,
        picture: activity.place.picture.id ? activity.place.picture.thumbnails.x128.url.download : '',
        hasParent: !!activity.place.parent,
        parent: mapParentPlace(activity)
      };
    }

    function mapParentPlace(activity) {
      if (!activity.place || !activity.place.parent) {
        return {};
      }

      var parentPlace = {
        id: activity.place.getParent().getId(),
        name: activity.place.getParent().getName(),
        picture: '/assets/icons/absents_place.svg'
      };

      if (activity.place.getParent().getPicture().getThumbnail(64)) {
        parentPlace.picture = activity.place.getParent().getPicture().getThumbnail(64).getUrl().view;
      } else if (activity.place.getParent().getPicture().getLargestThumbnail()) {
        parentPlace.picture = activity.place.getParent().getPicture().getLargestThumbnail().getUrl().view;
      } else if (activity.place.getParent().getPicture().getId()) {
        parentPlace.picture = activity.place.getParent().getPicture().getOrg().getUrl().view;
      }

      return parentPlace;
    }

    function sortActivities(activities) {
      return _.orderBy(activities, 'date', 'desc');
    }

    function toActivityItem(activity) {
      return {
        id: activity.id,
        actor: mapActivityActor(activity),
        member: mapActivityMember(activity),
        comment: mapActivityComment(activity),
        place: mapActivityPlace(activity),
        post: mapActivityPost(activity),
        date: moment(activity.date),
        type: activity.type
      };
    }
  }

})();
