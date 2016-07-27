(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log,
    _, moment,
    NST_ACTIVITY_FILTER,
    NstSvcServer, NstSvcActivityStorage, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory,
    NstFactoryError, NstFactoryQuery, NstActivity, NstUser, NstPlace, NstTinyComment, NstPost, NstTinyPlace, NstPicture, NstAttachment) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      get: get,
      getRecent: getRecent,
      parseActivity : parseActivity,
      parseActivityEvent : parseActivityEvent
    };

    return service;

    function parseActivity(data) {
      console.log('event', data);
      var defer = $q.defer();

      var activity = new NstActivity();

      activity.id = data._id.$oid;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.lastUpdate = new Date(data.last_update);
      activity.memberType = data.memberType;

      $q.all([
        extractActor(data),
        extractPost(data),
        extractPlace(data),
        extractComment(data),
        extractMember(data),
      ]).then(function(values) {

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

        if (!data.actor) {
          defer.resolve(null);
        } else {
          var user = NstSvcUserFactory.parseTinyUser({
            _id: data.actor,
            fname: data.actor_fname,
            lname: data.actor_lname,
            picture: data.actor_picture,
          });

          // TODO: Add user to cache if the model is rich enough

          defer.resolve(user);
        }

        return defer.promise;
      }

      function extractPost(data) {
        var defer = $q.defer();

        if (!data.post_id) { // could not find any post inside
          defer.resolve(null);
        } else {
          var attachmentPromises = _.map(data.post_attachments, function (attachment) {
            return NstSvcAttachmentFactory.parseAttachment(attachment);
          });

          $q.all(attachmentPromises).then(function (values) {
            var tinyPost = new NstPost({
              id: data.post_id.$oid,
              subject: data.post_subject,
              body: data.post_body,
              senderId: data.actor,
              places: _.map(data.post_places, function(place) {
                return new NstTinyPlace({
                  id: place._id,
                  name: place.name,
                  picture: new NstPicture(null, place.picture)
                });
              }),
              attachments : values
            });

            defer.resolve(tinyPost);
          });
        }

        return defer.promise;
      }

      function extractComment(data) {
        var defer = $q.defer();
        if (!data.comment_id) { // could not find any comment inside
          defer.resolve(null);
        } else {
          defer.resolve(new NstTinyComment({
            id: data.comment_id.$oid,
            body: data.comment_body,
            postId: data.post_id.$oid
          }));
        }

        return defer.promise;
      }

      function extractPlace(data) {
        var defer = $q.defer();

        if (!data.place_id) {
          defer.resolve(null);
        } else {

          var placeId = data.child_id || data.place_id;
          NstSvcPlaceFactory.get(placeId).then(function(place) {
            defer.resolve(place);
          }).catch(defer.reject);
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
            fullName: data.invitee_name,
            type: data.member_type
          });
        }

        return defer.promise;
      }

    }

    function parseActivityEvent(data) {
        console.log('event', data);
        var defer = $q.defer();

        var activity = new NstActivity();

        activity.id = data._id.$oid;
        activity.type = data.action;
        activity.date = new Date(data.timestamp);
        activity.lastUpdate = new Date(data.last_update);
        activity.memberType = data.memberType;

        $q.all([
          extractActor(data),
          extractPost(data),
          extractPlace(data),
          extractComment(data),
          extractMember(data),
        ]).then(function(values) {

          activity.actor = values[0];
          activity.post = values[1];
          activity.place = values[2];
          activity.comment = values[3];
          activity.member = values[4];

          defer.resolve(activity);

        }).catch(defer.reject);

        return defer.promise;

        function extractActor(data) {
          if (data.actor) {
            return NstSvcUserFactory.get(data.actor);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractActor(data) {
          if (data.by) {
            return NstSvcUserFactory.get(data.by);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractPost(data) {
          if (data.post_id) { // could not find any post inside
            return NstSvcPostFactory.get(data.post_id);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractComment(data) {
          if (data.comment_id) { // could not find any post inside
            return NstSvcCommentFactory.get(data.comment_id.$oid);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractPlace(data) {
          if (data.place_id && data.place_id.length > 0){
            return NstSvcPlaceFactory.get(data.place_id[0]);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractMember(data) {
          var defer = $q.defer();

          if (!data.member_id) { // could not find a member inside
            defer.resolve(null); // TODO: decide to fill with an empty object or an empty NstUser
          } else {
            NstSvcUserFactory.get(data.member_id).then(function (member) {
              defer.resolve({
                id: data.member_id,
                fullName: member.fullName,
                type: data.member_type
              });
            }).catch(defer.reject);
          }

          return defer.promise;
        }
    }

    function get(settings) {
      var defaultSettings = {
        limit: 32,
        placeId: null,
        date: null,
        filter: 'all'
      };
      settings = _.defaults(settings, defaultSettings);
      if (settings.placeId) {
        return getByPlace(settings);
      } else {
        return getAll(settings);
      }
    }

    function getAll(settings) {
      var defer = $q.defer();

      NstSvcServer.request('timeline/get_events', {
        limit: settings.limit,
        before: settings.date,
        filter: settings.filter
      }).then(function(data) {
        var activities = _.map(data.events, parseActivity);

        $q.all(activities).then(function(values) {
          defer.resolve(values);
        }).catch(defer.reject);

      }).catch(defer.reject);

      return defer.promise;
    }

    function getRecent(settings) {
      var mandatorySettings = {
        filter: NST_ACTIVITY_FILTER.ALL,
        limit: 15
      };
      settings = _.defaults(settings, mandatorySettings);
      return get(settings);
    }

    function getByPlace(settings) {

      if (!settings.placeId) {
        throw 'Could not find the place id.';
      }

      var defer = $q.defer();

      NstSvcServer.request('timeline/get_events', {
        limit: settings.limit,
        before: settings.date,
        place_id: settings.placeId,
        filter: settings.filter
      }).then(function(data) {
        var activities = _.map(data.events, parseActivity);

        $q.all(activities).then(function(values) {
          defer.resolve(values);
        }).catch(defer.reject);

      }).catch(defer.reject);

      return defer.promise;
    }
  }
})();
