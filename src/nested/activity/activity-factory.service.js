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
    ActivityFactory.prototype.parseActivity = parseActivity;

    var factory = new ActivityFactory();
    return factory;

    function parseActivity(data) {
      var defer = $q.defer();

      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.lastUpdate = new Date(data.last_update);
      activity.memberType = data.memberType;
      $q.all([
        extractActor(data),
        extractPost(data),
        extractPlace(data),
        extractComment(data),
        extractMember(data)
      ]).then(function (values) {

        activity.actor = values[0];
        activity.post = values[1];
        activity.place = values[2];
        activity.comment = values[3];
        activity.member = values[4];

        defer.resolve(activity);

      }).catch(defer.reject);

      return defer.promise;

      function extractActor(data) {
        var defer = $q.defer();

        if (!data.actor_id) {
          defer.resolve(null);
        } else {
          NstSvcUserFactory.get(data.actor_id)
            .then(function (user) {
              defer.resolve(user);
            });
        }

        return defer.promise;
      }

      function extractPost(data) {
        var defer = $q.defer();

        if (!data.post_id) { // could not find any post inside
          defer.resolve(null);
        } else {
          NstSvcPostFactory.get(data.post_id)
            .then(function (post) {

              var attachmentPromises = _.map(post.post_attachments, function (attachment) {
                if (attachment._id)
                  return NstSvcAttachmentFactory.parseAttachment(attachment);
              });

              $q.all(attachmentPromises).then(function (values) {
                var tinyPost = new NstPost({
                  id: post.getId(),
                  subject: post.getSubject(),
                  body: post.getBody(),
                  senderId: post.actor,
                  places: post.places,
                  attachments: values
                });

                defer.resolve(tinyPost);
              });

            }).catch(function () {
            defer.resolve(null);
          })
        }


        return defer.promise;
      }

      function extractComment(data) {
        var defer = $q.defer();
        if (!data.comment_id) { // could not find any comment inside
          defer.resolve(null);
        } else {
          NstSvcCommentFactory
            .getComment(data.comment_id, data.post_id)
            .then(function (comment) {
              defer.resolve(comment);
            })
        }

        return defer.promise;
      }

      function extractPlace(data) {
        var defer = $q.defer();

        if (!data.place_id) {
          defer.resolve(null);
        } else {

          if (data.child_id) {
            defer.resolve(new NstTinyPlace({
              id: angular.isObject(data.child_id) ? data.child_id.$oid : data.child_id,
              name: data.place_name,
              picture: data.place_picture ? new NstPicture(data.place_picture.org, data.place_picture) : new NstPicture(),
              parent: new NstTinyPlace({
                id: angular.isObject(data.place_id) ? data.place_id.$oid : data.place_id,
                name: data.parent_name,
                picture: new NstPicture(),
              })
            }));

          } else {
            defer.resolve(new NstTinyPlace({
              id: angular.isObject(data.place_id) ? data.place_id.$oid : data.place_id,
              name: data.place_name,
              picture: data.place_picture ? new NstPicture(data.place_picture.org, data.place_picture) : new NstPicture()
            }));
          }

          // }).catch(defer.reject);
        }

        return defer.promise;
      }

      function extractMember(data) {
        var defer = $q.defer();

        if (!data.member_id) { // could not find a member inside
          defer.resolve(null); // TODO: decide to fill with an empty object or an empty NstUser
        } else {
          defer.resolve({
            id: data.member_id,
            fullName: data.member_name || data.invitee_name,
            type: data.member_type
          });
        }

        return defer.promise;
      }

    }

    function parseActivityIntelligently(data) {
      if (!data) {
        return null;
      }

      if (!data._id) {
        return null;
      }

      switch (data.action) {
        case NST_EVENT_ACTION.MEMBER_REMOVE:
          return parseMemberRemoveActivity(data);
        case NST_EVENT_ACTION.MEMBER_INVITE:
          return parseMemberInviteActivity(data);
        case NST_EVENT_ACTION.MEMBER_JOIN:
          return parseMemberJoinActivity(data);
        case NST_EVENT_ACTION.PLACE_ADD:
          return parsePlaceAddActivity(data);
        case NST_EVENT_ACTION.POST_ADD:
          return parseAddPostActivity(data);
        case NST_EVENT_ACTION.COMMENT_ADD:
          return parseAddCommentActivity(data);
        default:
          throw Error('The provided activity type is not supported.');
      }
    }

    function parseAddPostActivity(data) {

      if (data.action !== NST_EVENT_ACTION.POST_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.POST_ADD));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      // TODO: Not required anymore, because the actor and comment sender are the same
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      $q.all([postPromise, actorPromise]).then(function (resultSet) {
        activity.post = resultSet[0];
        activity.actor = resultSet[1];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseAddCommentActivity(data) {
      if (data.action !== NST_EVENT_ACTION.COMMENT_ADD) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.COMMENT_ADD));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var postPromise = NstSvcPostFactory.get(data.post_id);
      var commentPromise = NstSvcCommentFactory.getComment(data.comment_id, data.post_id);
      // TODO: Not required anymore, because the actor and comment sender are the same
      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);

      $q.all([postPromise, commentPromise, actorPromise]).then(function (resultSet) {
        activity.post = resultSet[0];
        activity.comment = resultSet[1];
        activity.actor = resultSet[2];

        deferred.resolve(activity);
      }).catch(function (error) {
        deferred.resolve(null);
        NstSvcLogger.error("Activity Factory GET:" , error)
      });

      return deferred.promise;
    }

    function parseMemberRemoveActivity(data) {
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

    function parseMemberJoinActivity(data) {
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

    function parseMemberInviteActivity(data) {
      if (data.action !== NST_EVENT_ACTION.MEMBER_INVITE) {
        throw Error(NstUtility.string.format('The provided activity is not of {0} type.', NST_EVENT_ACTION.MEMBER_INVITE));
      }

      var deferred = $q.defer();
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      var actorPromise = NstSvcUserFactory.getTiny(data.actor_id);
      var inviteePromise = NstSvcUserFactory.getTiny(data.invitee_id);
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

    function parsePlaceAddActivity(data) {
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
            deferred.resolve(values);
          }).catch(deferred.reject);

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getRecentActivities', settings.placeId);
    }

  }
})();
