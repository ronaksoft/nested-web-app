(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log,
    _, moment,
    NstSvcServer, NstSvcActivityStorage, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory,
    NstFactoryError, NstFactoryQuery, NstActivity, NstUser, NstPlace, NstTinyComment, NstPost, NstTinyPlace, NstPicture, NstAttachment) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      load: load,
      getRecent: getRecent
    };

    return service;

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
    }

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
          attachments: _.map(data.post_attachments, function(item) {
            return new NstAttachment({
              // id : ,
              // postId : ,
              //
            });
          })
        });

        defer.resolve(tinyPost);
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

    function load(settings) {
      var defer = $q.defer();

      var activities = NstSvcActivityStorage.get('all', []);

      if (activities.length === 0) { // cache is empty and it's better to ask the server for recent activities
        NstSvcServer.request('timeline/get_events', {
          limit: settings.limit,
          skip: settings.skip
        }).then(function(data) {
          var activities = _.map(data.events, parseActivity);

          $q.all(activities).then(function(values) {
            NstSvcActivityStorage.merge('all', values);
            defer.resolve(values);
          }).catch(defer.reject);

        }).catch(defer.reject);
      } else {
        defer.resolve(activities);
      }

      return defer.promise;
    }

    function getRecent(settings) {
      var defer = $q.defer();

      var defaultSettings = {
        limit: 10,
        placeId: null
      };
      settings = _.defaults(defaultSettings, settings);

      if (settings.placeId) {
        getPlaceActivities(settings).then(defer.resolve).catch(defer.reject);
      } else {
        load(settings).then(defer.resolve).catch(defer.reject);
      }

      return defer.promise;
    }

    function getPlaceActivities(settings) {

      if (!settings.placeId) {
        throw 'Could not find the place id.';
      }

      var activities = NstSvcActivityStorage.get('all', []);

      if (activities.length === 0) { // cache is empty and it's better to ask the server for recent activities
        NstSvcServer.request('place/get_events', {
          limit: settings.limit,
          skip: 0,
          place_id: settings.placeId
        }).then(function(data) {
          var activities = _.map(data.events, parseActivity);

          $q.all(activities).then(function(values) {
            NstSvcActivityStorage.merge('all', values);
            defer.resolve(values);
          }).catch(defer.reject);

        }).catch(defer.reject);
      } else {
        var placeActivities = _.filter(activities, function(act) {
          return _.some(act.places, function(place) {
            return place.id === settings.placeId;
          });
        });

        defer.resolve(placeActivities);
      }

    }
  }
})();
