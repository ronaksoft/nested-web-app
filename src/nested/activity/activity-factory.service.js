(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, _,
    NST_ACTIVITY_FILTER, NST_EVENT_ACTION,
    NstSvcServer, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcCommentFactory, NstSvcActivityCacheFactory,
    NstBaseFactory, NstSvcLogger, NstActivity, NstSvcLabelFactory, NstUtility) {


    function ActivityFactory() {}

    ActivityFactory.prototype = new NstBaseFactory();
    ActivityFactory.prototype.constructor = ActivityFactory;

    ActivityFactory.prototype.get = get;
    ActivityFactory.prototype.getAfter = getAfter;
    ActivityFactory.prototype.getRecent = getRecent;
    ActivityFactory.prototype.parseActivity = parseActivity;

    var factory = new ActivityFactory();
    return factory;

    function parseActivity(data) {
      if (!data) {
        return null;
      }

      if (!data._id) {
        return null;
      }

      switch (data.action) {
        case NST_EVENT_ACTION.MEMBER_REMOVE:
          return parseMemberRemove(data);
        case NST_EVENT_ACTION.MEMBER_JOIN:
          return parseMemberJoin(data);

        case NST_EVENT_ACTION.PLACE_ADD:
          return parsePlaceAdd(data);

        case NST_EVENT_ACTION.COMMENT_ADD:
          return parseAddComment(data);
        case NST_EVENT_ACTION.COMMENT_REMOVE:
          return parseRemoveComment(data);

        case NST_EVENT_ACTION.LABEL_ADD:
          return parseAddLabel(data);
        case NST_EVENT_ACTION.LABEL_REMOVE:
          return parseRemoveLabel(data);

        case NST_EVENT_ACTION.POST_ADD:
          return parsePostAdd(data);
        case NST_EVENT_ACTION.POST_ATTACH_PLACE:
          return parsePostAttachPlace(data);
        case NST_EVENT_ACTION.POST_MOVE:
          return parsePostMove(data);
        case NST_EVENT_ACTION.POST_REMOVE_PLACE:
          return parsePostRemovePlace(data);
        default:
          NstSvcLogger.error('The provided activity type is not supported:' + data.action);
          return null;
      }
    }

    function parsePostAdd(data) {
      if (data.action !== NST_EVENT_ACTION.POST_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_ADD));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);
      activity.post = {
        id: data.post_id,
        body: data.post_preview,
        subject: data.post_subject
      };
      activity.places = data.places;

      return activity;
    }

    function parsePostRemovePlace(data) {
      if (data.action !== NST_EVENT_ACTION.POST_REMOVE_PLACE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_REMOVE_PLACE));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);
      activity.post = {
        id: data.post_id,
        body: data.post_preview,
        subject: data.post_subject
      };

      return activity;
    }

    function parsePostAttachPlace(data) {
      if (data.action !== NST_EVENT_ACTION.POST_ATTACH_PLACE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_ATTACH_PLACE));
      }

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.post = {
        id: data.post_id,
        body: data.post_preview,
        subject: data.post_subject
      };
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);
      activity.attachedPlace = NstSvcPlaceFactory.parseTinyPlace(data.new_place);

      return activity;
    }

    function parsePostMove(data) {
      if (data.action !== NST_EVENT_ACTION.POST_MOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_MOVE));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.post = {
        id: data.post_id,
        body: data.post_preview,
        subject: data.post_subject
      };
      activity.oldPlace = NstSvcPlaceFactory.parseTinyPlace(data.old_place);
      activity.newPlace = NstSvcPlaceFactory.parseTinyPlace(data.new_place);
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseAddComment(data) {
      if (data.action !== NST_EVENT_ACTION.COMMENT_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.COMMENT_ADD));
      }

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);
      activity.post = {
        id: data.post_id,
        subject: data.post_subject
      };
      activity.comment = {
        body: data.comment_text
      };
      activity.places = data.places;

      return activity;
    }

    function parseAddLabel(data) {
      if (data.action !== NST_EVENT_ACTION.LABEL_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.LABEL_ADD));
      }

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.label = NstSvcLabelFactory.parse(data.label);
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.post = {
        id: data.post_id,
        subject: data.post_subject
      };

      return activity;
    }

    function parseRemoveLabel(data) {
      if (data.action !== NST_EVENT_ACTION.LABEL_REMOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.LABEL_REMOVE));
      }

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.label = NstSvcLabelFactory.parse(data.label);
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.post = {
        id: data.post_id,
        subject: data.post_subject
      };

      return activity;
    }

    function parseRemoveComment(data) {
      if (data.action !== NST_EVENT_ACTION.COMMENT_REMOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.COMMENT_REMOVE));
      }

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.post = {
        id: data.post_id
      };
      activity.comment = {
        body: data.comment_text
      };

      return activity;
    }

    function parseMemberRemove(data) {
      if (data.action !== NST_EVENT_ACTION.MEMBER_REMOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.MEMBER_REMOVE));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.member = NstSvcUserFactory.parseTinyUser(data.member);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);

      return activity;
    }

    function parseMemberJoin(data) {
      if (data.action !== NST_EVENT_ACTION.MEMBER_JOIN) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.MEMBER_JOIN));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.place = NstSvcPlaceFactory.parseTinyPlace(data.place);

      return activity;
    }

    function parsePlaceAdd(data) {
      if (data.action !== NST_EVENT_ACTION.PLACE_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.PLACE_ADD));
      }

      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.post = {
        id: data.post_id
      };

      return activity;
    }

    function getActivities(settings, cacheHandler) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('place/get_activities', {
          limit: settings.limit || 32,
          before: settings.before,
          after: settings.after,
          filter: settings.filter || 'all',
          place_id: settings.placeId,
          details: true
        }, function (cachedResponse) {
          if (_.isFunction(cacheHandler) && cachedResponse) {
            cacheHandler(_.map(cachedResponse.activities, parseActivity));
          }
        }).then(function (response) {

          deferred.resolve(_.map(response.activities, parseActivity));

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getActivities', settings.placeId);
    }

    function get(settings, cacheHandler) {
      return getActivities({
        limit: settings.limit,
        placeId: settings.placeId,
        before: settings.date,
        filter: settings.filter
      }, cacheHandler);
    }

    function getAfter(settings) {
      return getActivities({
        limit: settings.limit,
        placeId: settings.placeId,
        after: settings.date,
        filter: settings.filter
      });
    }

    function getRecent(settings, cacheHandler) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('place/get_activities', {
          filter: NST_ACTIVITY_FILTER.ALL,
          limit: settings.limit || 10,
          place_id: settings.placeId,
          details: true
        }, function(cachedResponse) {
          if (_.isFunction(cacheHandler) && cachedResponse) {
            var activities = _.chain(cachedResponse.activities).map(parseActivity).compact().value();
            cacheHandler(activities);
          }
        }).then(function (response) {

          deferred.resolve(_.map(response.activities, parseActivity));

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getRecentActivities', settings.placeId);
    }
  }
})();
