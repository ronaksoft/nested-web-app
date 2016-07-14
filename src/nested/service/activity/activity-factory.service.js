(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log, _, moment,
                             // NstSvcUserFactory
                             NstSvcServer, NstSvcActivityStorage, NstSvcPostFactory, NstSvcPlaceFactory,
                             NstFactoryError, NstFactoryQuery, NstActivity, NstUser, NstPlace) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      load : load,
      getRecent : getRecent
    };

    return service;

    function parseActivity(data) {
      var defer = $q.defer();

      var activity = new NstActivity();

      activity.id = data._id.$oid;
      activity.type = data.action;
      // activity.date = new Date(data.date * 1e3);
      activity.date = moment(data['timestamp']);
      activity.memberType = data.memberType;

      $q.all([
        extractActor(data),
        extractPost(data),
        extractPlaces(data),
        extractComment(data),
        extractMember(data),
      ]).then(function (values) {

        activity.actor = values[0];
        activity.post = values[1];
        activity.place = values[2];
        activity.comment = values[3];
        activity.memebr = values[4];

        defer.resolve(activity);

      }).catch(defer.reject);

      return defer.promise;
    }

    function extractActor(data) {
      var defer = $q.defer();

      if (!data.actor) { // could not find an actor inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstUser
      }
      else {
        //TODO : Use NstSvcUserFactory to parse user model
        // var user = NstSvcUserFactory.parseUser({
        //       _id : data.actor,
        //     fname : data.actor_fname,
        //     lname : data.actor_lname,
        //   picture : data.actor_picture,
        // });
        var user = new NstUser({
          username : data.actor,
          fullname : data.actor_name
        });

        // TODO: Add user to cache if the model is rich enough

        defer.resolve(user);
      }

      return defer.promise;
    }

    function extractPost(data) {

      var defer = $q.defer();

      if (!data.post_id) { // could not find any post inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstPost
      }
      else {
        // TODO: find the user in data or get it from factory
        //  1. NstSvcUserFactory.get(data.actor)
        //  2. extractActor(data)
        extractActor(data).then(function (user) {
          NstSvcPostFactory.parsePost({
                           _id : data.post_id,
                        sender : user,
                       subject : data.post_subject,
                          body : data.post_body,
              post_attachments : data.post_attachments,
                   post_places : data.post_places,
                          date : data['time-stamp']
          }).then(function (post) {
            defer.resolve(post);
          }).catch(defer.reject);
        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function extractComment(data) {

      var defer = $q.defer();

      if (!data.post_id) { // could not find any comment inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstComment
      }
      else {
        // TODO: find the user in data or get it from factory
        //  1. NstSvcUserFactory.get(data.actor)
        //  2. extractActor(data)
        extractActor(data).then(function (user) {
          var comment = NstSvcPostFactory.parseComment({
                       _id : data.comment_id,
                    attach : true,
                 // TODO : This is not filled yet
                 sender_id : user.actor,
              sender_fname : user.actor_fname,
              sender_lname : user.actor_lname,
            sender_picture : user.actor_picture,
                      text : data.comment_body,
                      time : data.date
          });

          defer.resolve(comment);
        });

      }

      return defer.promise;
    }

    function extractPlaces(data) {
      var defer = $q.defer();

      if (!data.post_places) { // could not find an actor inside
        defer.resolve([]); // TODO: decide to fill with an empty object or an empty NstUser
      }
      else {
        var places = [];

        _.forEach(data.post_places, function (place) {
          places.push(new NstPlace({
            id : place._id,
            name : place.name
          }));
        });

        defer.resolve(places);
      }

      return defer.promise;
    }

    function extractMember(data) {
      var defer = $q.defer();

      if (!data.member_id) { // could not find a member inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstUser
      }
      else {
        // TODO: Use NstSvcUserFactory to find the member
        // NstSvcUserFactory.get(data.member_id).then(defer.resolve).catch(defer.reject);
        defer.resolve({
          id : data.member_id
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
        }).then(function (data) {
          var activities = _.map(data.events, parseActivity);

          $q.all(activities).then(function (values) {
            NstSvcActivityStorage.merge('all', values);
            defer.resolve(values);
          }).catch(defer.reject);

        }).catch(defer.reject);
      }
      else {
        defer.resolve(activities);
      }

      return defer.promise;
    }

    function getRecent(settings) {
      var defer = $q.defer();

      var defaultSettings = {
        limit : 10,
        placeId : null
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
      var defaultSettings = {
        limit : 10,
      };
      settings = _.defaults(defaultSettings, settings);

      if (!settings.placeId) {
        throw 'Could not find the place id.'
      }

      var activities = NstSvcActivityStorage.get('all', []);

      if (activities.length === 0) { // cache is empty and it's better to ask the server for recent activities
        NstSvcServer.request('place/get_events', {
          limit : settings.limit,
          skip : 0,
          place_id : settings.placeId
        }).then(function (data) {
          var activities = _.map(data.events, parseActivity);

          $q.all(activities).then(function (values) {
            NstSvcActivityStorage.merge('all', values);
            defer.resolve(values);
          }).catch(defer.reject);

        }).catch(defer.reject);
      }
      else {
        var placeActivities = _.filter(activities, function (act) {
          return _.some(act.places, function (place) {
            return place.id === settings.placeId;
          });
        });

        defer.resolve(placeActivities);
      }

    }
  }
})();
