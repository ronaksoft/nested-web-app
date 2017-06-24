(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log,
                                 _,
                                 NST_ACTIVITY_FILTER, NST_EVENT_ACTION,
                                 NstSvcServer, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcCommentFactory, NstUtility,
                                 NstBaseFactory, NstSvcLogger, NstActivity, NstPost, NstTinyPlace, NstPicture) {


    function ActivityFactory() {}

    ActivityFactory.prototype = new NstBaseFactory();
    ActivityFactory.prototype.constructor = ActivityFactory;

    ActivityFactory.prototype.get = get;
    ActivityFactory.prototype.getAfter = getAfter;
    ActivityFactory.prototype.getRecent = getRecent;
    ActivityFactory.prototype.parseActivityIntelligently = parseActivityIntelligently;

    var factory = new ActivityFactory();
    return factory;

    function parseActivityIntelligently(data) {
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

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      $q.all([postPromise]).then(function (resultSet) {
        activity.post = resultSet[0];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parsePostRemovePlace(data) {
      if (data.action !== NST_EVENT_ACTION.POST_REMOVE_PLACE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_REMOVE_PLACE));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      // TODO: Not required anymore, because the actor and comment sender are the same
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      var placePromise = NstSvcPlaceFactory.getTiny(data.place_id);

      $q.all([postPromise, actorPromise, placePromise]).then(function (resultSet) {
        activity.post = resultSet[0];
        activity.actor = resultSet[1];
        activity.place = resultSet[2];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parsePostAttachPlace(data) {
      if (data.action !== NST_EVENT_ACTION.POST_ATTACH_PLACE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_ATTACH_PLACE));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      // TODO: Not required anymore, because the actor and comment sender are the same
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      var placePromise = NstSvcPlaceFactory.getTiny(data.place_id);
      $q.all([postPromise, actorPromise, placePromise]).then(function (resultSet) {
        activity.post = resultSet[0];
        activity.actor = resultSet[1];
        activity.place = resultSet[2];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parsePostMove(data) {
      if (data.action !== NST_EVENT_ACTION.POST_MOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_MOVE));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      var oldPlacePromise = NstSvcPlaceFactory.getTiny(data.old_place_id);
      var newPlacePromise = NstSvcPlaceFactory.getTiny(data.new_place_id);
      $q.all([postPromise, oldPlacePromise, newPlacePromise]).then(function (resultSet) {
        activity.post = resultSet[0];
        activity.oldPlace = resultSet[1];
        activity.newPlace = resultSet[2];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseAddComment(data) {
      if (data.action !== NST_EVENT_ACTION.COMMENT_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.COMMENT_ADD));
      }

      var deferred = $q.defer();



      var postPromise = NstSvcPostFactory.get(data.post_id);
      var commentPromise = NstSvcCommentFactory.getComment(data.comment_id, data.post_id);

      $q.all([postPromise, commentPromise]).then(function (resultSet) {
        var activity = new NstActivity();
        activity.id = data._id;
        activity.type = data.action;
        activity.date = new Date(data.timestamp);
        activity.post = resultSet[0];
        activity.comment = resultSet[1];
        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseRemoveComment(data) {
      if (data.action !== NST_EVENT_ACTION.COMMENT_REMOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.COMMENT_REMOVE));
      }

      var deferred = $q.defer();

      var commentPromise = NstSvcCommentFactory.getComment(data.comment_id, data.post_id);
      // TODO: Not required anymore, because the actor and comment sender are the same
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);

      $q.all([commentPromise, actorPromise]).then(function (resultSet) {
        var activity = new NstActivity();
        activity.id = data._id;
        activity.type = data.action;
        activity.date = new Date(data.timestamp);
        activity.comment = resultSet[0];
        activity.actor = resultSet[1];
        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseMemberRemove(data) {
      if (data.action !== NST_EVENT_ACTION.MEMBER_REMOVE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.MEMBER_REMOVE));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      var inviteePromise = NstSvcUserFactory.getTiny(data.member_id);
      var placePromise = NstSvcPlaceFactory.getTiny(data.place_id);

      $q.all([actorPromise, inviteePromise, placePromise]).then(function (resultSet) {
        activity.actor = resultSet[0];
        activity.member = resultSet[1];
        activity.place = resultSet[2];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseMemberJoin(data) {
      if (data.action !== NST_EVENT_ACTION.MEMBER_JOIN) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.MEMBER_JOIN));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      var placePromise = NstSvcPlaceFactory.getTiny(data.place_id);

      $q.all([actorPromise, placePromise]).then(function (resultSet) {
        activity.actor = resultSet[0];
        activity.place = resultSet[1];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parsePlaceAdd(data) {
      if (data.action !== NST_EVENT_ACTION.PLACE_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.PLACE_ADD));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var placePromise = NstSvcPlaceFactory.getTiny(data.place_id);
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);

      $q.all([placePromise, actorPromise]).then(function (resultSet) {
        activity.place = resultSet[0];
        activity.actor = resultSet[1];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function getActivities(settings) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('place/get_activities', {
          limit: settings.limit || 32,
          before: settings.before,
          after: settings.after,
          filter: settings.filter || 'all',
          place_id: settings.placeId
        }).then(function (response) {

          var activities = _.map(response.activities, parseActivityIntelligently);

          $q.all(activities).then(function (values) {
            deferred.resolve(values.filter(function (obj) {
              return obj !== null;
            }));
          }).catch(deferred.reject);

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getActivities', settings.placeId);
    }

    function get(settings) {
      return getActivities({
        limit: settings.limit,
        placeId: settings.placeId,
        before: settings.date,
        filter: settings.filter
      });
    }

    function getAfter(settings) {
      return getActivities({
        limit: settings.limit,
        placeId: settings.placeId,
        after: settings.date,
        filter: settings.filter
      });
    }

    function getRecent(settings) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('place/get_activities', {
          filter: NST_ACTIVITY_FILTER.ALL,
          limit: settings.limit || 10,
          place_id: settings.placeId
        }).then(function (response) {

          var activities = _.map(response.activities, parseActivityIntelligently);

          $q.all(activities).then(function (values) {
            deferred.resolve(values.filter(function (obj) {
              return obj !== null;
            }));
          }).catch(deferred.reject);

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getRecentActivities', settings.placeId);
    }

  }
})();
