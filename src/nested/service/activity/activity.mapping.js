(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityMapping', NstSvcActivityMapping);

  /** @ngInject */
  function NstSvcActivityMapping($log, _, moment) {

    var service = {
      mapActivityItem: mapActivityItem
    };

    return service;

    function mapActivityItem(item) {
      return {
        id: item.id,
        actor: mapActivityActor(item),
        member: mapActivityMember(item),
        comment: mapActivityComment(item),
        post: mapActivityPost(item),
        date: getPassedTime(item.date),
        type: item.type
      };
    }

    function getPassedTime(date) {
      if (!moment.isMoment(date)) {
        date = moment(date);
      }

      return date.fromNow();
    }

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
        subject: activity.post.subject
      };
    }

    function mapActivityActor(activity) {
      return {
        id: activity.actor.id,
        avatar: activity.actor.picture.thumbnails.x32.url.download,
        name: activity.actor.fullName
      };
    }

  }
})();
