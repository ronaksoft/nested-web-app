(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcPostActivityFactory', NstSvcPostActivityFactory);

  /** @ngInject */
  function NstSvcPostActivityFactory($q, $rootScope, _, NST_POST_EVENT_ACTION, NstSvcServer, NstSvcUserFactory, NstSvcLogger,
                                     NstBaseFactory, NstSvcLabelFactory, NstCollector, NstPostActivity, NstSvcDate, NstSvcPostFactory,
                                     NstUtility, NstSvcAttachmentFactory, NstSvcCommentFactory, NST_SRV_PUSH_CMD) {


    function ActivityFactory() {
      this.latestActivityTimestamp = NstSvcDate.now();

      var self = this;
      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_POST_ACTIVITY, function (event) {
        self.dispatchActivityPushEvents(event.detail);
      });
    }

    function dispatchActivityPushEvents(detail) {
      var self = this;
      getAfter({
        date: self.latestActivityTimestamp,
        postId: detail.post_id
      }).then(function (data) {
        var nearActTime = self.latestActivityTimestamp;
        // filter received activities with latest time
        var newActs = _.filter(data, function (act) {
          //check and update near activity timestamp
          if (act.date > nearActTime) {
            nearActTime = act.date;
          }
          return act.date > self.latestActivityTimestamp;
        });

        // update latestActivityTimestamp with near activity time
        self.latestActivityTimestamp = nearActTime;

        //check each activity and dispatch sync events
        _.map(newActs, function (act) {
          $rootScope.$broadcast(NST_POST_EVENT_ACTION.SYNC_POST_ACTIVITY + act.type, {
            activity: act
          });
        });

        // check data length and try to get more new activity
        if (data.length === 32) {
          dispatchActivityPushEvents(detail)
        }
      });
    }

    ActivityFactory.prototype = new NstBaseFactory();
    ActivityFactory.prototype.constructor = ActivityFactory;
    ActivityFactory.prototype.getActivities = getActivities;
    ActivityFactory.prototype.dispatchActivityPushEvents = dispatchActivityPushEvents;

    function parseActivity(data) {
      if (!data) {
        return null;
      }

      if (!data._id) {
        return null;
      }

      switch (data.action) {
        case NST_POST_EVENT_ACTION.COMMENT_ADD:
        case NST_POST_EVENT_ACTION.COMMENT_REMOVE:
          return parseCommentActivity(data);
        case NST_POST_EVENT_ACTION.LABEL_ADD:
        case NST_POST_EVENT_ACTION.LABEL_REMOVE:
          return parseLabelActivity(data);
        case NST_POST_EVENT_ACTION.EDITED:
          return parsePostEdit(data);
        case NST_POST_EVENT_ACTION.ATTACH:
          return parsePostAttach(data);
        case NST_POST_EVENT_ACTION.MOVE:
          return parsePostMove(data);
        default:
          NstSvcLogger.error('The provided activity type is not supported:' + data.action);
          return null;
      }
    }

    function parseDefault(data) {
      var activity = new NstPostActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.postId = data.post_id;
      return activity;
    }

    function parsePostEdit(data) {
      var activity = parseDefault(data);
      activity.post = NstSvcPostFactory.parsePost(data.post);
      return activity;
    }

    function parsePostAttach(data) {
      var activity = parseDefault(data);
      activity.newPlace = NstSvcPlaceFactory.parseTinyPlace(data.new_place);
      return activity;
    }

    function parsePostMove(data) {
      var activity = parseDefault(data);
      activity.oldPlace = NstSvcPlaceFactory.parseTinyPlace(data.old_place);
      activity.newPlace = NstSvcPlaceFactory.parseTinyPlace(data.new_place);
      return activity;
    }

    function parseCommentActivity(data) {
      var activity = parseDefault(data);
      activity.comment = NstSvcCommentFactory.parseComment(data.comment);
      return activity;
    }

    function parseLabelActivity(data) {
      var activity = parseDefault(data);
      activity.label = NstSvcLabelFactory.parseLabel(data.label);
      return activity;
    }

    function getActivities(settings, cacheHandler) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('post/get_activities', {
          limit: settings.limit || 32,
          before: settings.before,
          after: settings.after,
          filter: settings.filter || 'all',
          post_id: settings.postId,
          details: true
        }, function (cachedResponse) {
          if (_.isFunction(cacheHandler) && cachedResponse) {
            cacheHandler(_.map(cachedResponse.activities, function(activity) {
              activity.post_id = settings.postId;
              return parseActivity(activity);
            }));
          }
        }).then(function (response) {

          deferred.resolve(_.map(response.activities, function(activity) {
            activity.post_id = settings.postId;
            return parseActivity(activity);
          }));

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getPostActivities', settings.postId);
    }

    function get(settings, cacheHandler) {
      return getActivities({
        limit: settings.limit,
        postId: settings.postId,
        after: settings.date,
        filter: settings.filter
      }, cacheHandler);
    }

    function getAfter(settings) {
      return getActivities({
        limit: settings.limit,
        postId: settings.postId,
        after: settings.date,
        filter: settings.filter
      });
    }

    var factory = new ActivityFactory();
    return factory;
  }
})();
