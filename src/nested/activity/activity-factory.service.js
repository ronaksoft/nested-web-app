(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcActivityFactory', NstSvcActivityFactory);

  /** @ngInject */
  function NstSvcActivityFactory($q, $log, _, moment,
                             NstSvcActivityStorage, WsService,
                             NstFactoryError, NstFactoryQuery, NstActivity) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      load : load,

    };

    return service;

    function parseActivity(data) {
      var defer = $q.defer();

      var activity = new NstActivity();

      activity.id = data._id.$oid;
      activity.type = data.action;
      // activity.date = new Date(data.date * 1e3);
      activity.date = moment.unix(data.date);
      activity.lastUpdate = moment.unix(data['last-update']);
      activity.memberType = data.memberType;

      $q.all([
        extractActor(data),
        extractPost(data),
        extractPlace(data),
        extractComment(data),
        extractMember(data),
      ]).then(function (values) {

        activity.actor = values[0];
        activity.post = values[1];
        activity.place = values[2];
        activity.comment = values[3];
        activity.memebr = values[4];

      }).catch(defer.reject);

      return defer.promise;
    }

    function extractActor(data) {
      var defer = $q.defer();

      if (!data.actor) { // could not find an actor inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstUser
      }
      else {
        var user = NstSvcUserFactory.parseUser({
              _id : data.actor,
            fname : data.actor_fname,
            lname : data.actor_lname,
          picture : data.actor_picture,
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
          defer.resolve(NstSvcPostFactory.parsePost({
                         _id : data.post_id,
                      sender : user,
                     subject : data.post_subject,
                        body : data.post_body,
            post_attachments : data.post_attachments,
                 post_places : data.post_places,
                'time-stamp' : data.date
          }));
        });
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
                 sender_id : actor.actor,
              sender_fname : actor.actor_fname,
              sender_lname : actor.actor_lname,
            sender_picture : actor.actor_picture,
                      text : data.comment_body,
                      time : data.date
          });

          defer.resolve(comment);
        });

      }

      return defer.promise;
    }

    function extractPlace(data) {

    }

    function extractMember(data) {
      var defer = $q.defer();

      if (!data.member_id) { // could not find a member inside
        defer.resolve({}); // TODO: decide to fill with an empty object or an empty NstUser
      }
      else {
        NstSvcUserFactory.get(data.member_id).then(defer.resolve).catch(defer.reject);
      }

      return defer.promise;
    }

    function load(settings) {
      var defer = $q.defer;

      WsService.request('timeline/get_events', {
        limit: settings.limit,
        skip: settings.skip
      }).then(function (data) {

        _.forEach(data.events, function (item) {
          NstSvcActivityStorage.add(parseActivity(item));
        });

        var activities = NstSvcActivityStorage.get();

        defer.resolve(activities);
      }).catch(defer.reject);

      return defer.promise;
    }

  }
})();
