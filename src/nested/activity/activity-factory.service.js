(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log,
    _, moment,
    NST_ACTIVITY_FILTER, NST_SRV_EVENT, NST_ACTIVITY_FACTORY_EVENT,
    NstSvcServer, NstSvcActivityStorage, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcAttachmentFactory, NstSvcCommentFactory,
    NstObservableObject, NstFactoryError, NstFactoryQuery, NstActivity, NstUser, NstPlace, NstTinyComment, NstPost, NstTinyPlace, NstPicture, NstAttachment, NstFactoryEventData) {

    function ActivityFactory() {
      var that = this;

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
        var activity = parseActivityEvent(event.detail.timeline_data).then(function (activity) {
          that.dispatchEvent(new CustomEvent(NST_ACTIVITY_FACTORY_EVENT.ADD, new NstFactoryEventData(activity)));
        }).catch(function (error) {
          $log.debug(error);
        });
      });
    }

    ActivityFactory.prototype = new NstObservableObject();
    ActivityFactory.prototype.constructor = ActivityFactory;

    ActivityFactory.prototype.get = get;
    ActivityFactory.prototype.getRecent = getRecent;
    ActivityFactory.prototype.parseActivity  = parseActivity;
    ActivityFactory.prototype.parseActivityEvent  = parseActivityEvent;

    return new ActivityFactory();

    function parseActivity(data) {
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
        var placeId, parentId;

        if (!data.place_id) {
          defer.resolve(null);
        } else {
          if (angular.isObject(data.place_id)) {
            placeId = data.place_id.$oid;
          } else {
            placeId = data.place_id;
          }

          NstSvcPlaceFactory.get(placeId).then(function(place) {
            if (data.parent_id) {
              place.getParent().setName(data.parent_name);
            }

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
        var defer = $q.defer();

        var activity = new NstActivity();
        console.log('recieved activity is :', data);

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
            console.log('has actor:', data.actor);
            return NstSvcUserFactory.get(data.actor);
          } else if (data.by) {
            console.log('has by :', data.by);
            return NstSvcUserFactory.get(data.by);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractPost(data) {
          if (data.post_id && data.post_id.$oid) {
            console.log('has post :', data.post_id.$oid);
            return NstSvcPostFactory.get(data.post_id.$oid);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractComment(data) {
          if (data.comment_id && data.comment_id.$oid) {
            console.log('has comment :', data.comment_id.$oid);
            return NstSvcCommentFactory.getComment(data.comment_id.$oid, data.post_id.$oid);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractPlace(data) {
          if (data.place_id && !_.isArray(data.place_id)){
            console.log('has place', data.place_id);
            return NstSvcPlaceFactory.get(data.place_id);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }
        }

        function extractMember(data) {
          if (data.member_id) {
            console.log('has a member : ', data.member_id);
            return NstSvcUserFactory.get(data.member_id);
          } else {
            return $q(function (resolve) {
              resolve(null);
            });
          }

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
        limit: 10,
        placeId : null
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
