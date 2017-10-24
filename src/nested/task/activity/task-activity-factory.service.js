(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcTaskActivityFactory', NstSvcTaskActivityFactory);

  /** @ngInject */
  function NstSvcTaskActivityFactory($q, _,
    NST_ACTIVITY_FILTER, NST_TASK_EVENT_ACTION,
    NstSvcServer, NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcCommentFactory, NstSvcActivityCacheFactory,
    NstBaseFactory, NstSvcLogger, NstActivity, NstSvcLabelFactory, NstUtility, NstSvcAttachmentFactory) {


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
        case NST_TASK_EVENT_ACTION.WATCHER_ADDED:
        case NST_TASK_EVENT_ACTION.WATCHER_REMOVED:
          return parseWatcher(data);
        case NST_TASK_EVENT_ACTION.ATTACHMENT_ADDED:
        case NST_TASK_EVENT_ACTION.ATTACHMENT_REMOVED:
          return parseAttachment(data);
        case NST_TASK_EVENT_ACTION.COMMENT:
          return parseComment(data);
        case NST_TASK_EVENT_ACTION.TITLE_CHANGED:
        case NST_TASK_EVENT_ACTION.DESC_CHANGED:
          return parseTask(data);
        case NST_TASK_EVENT_ACTION.CANDIDATE_ADDED:
        case NST_TASK_EVENT_ACTION.CANDIDATE_REMOVED:
          return parseCandidate(data);
        case NST_TASK_EVENT_ACTION.TODO_ADDED:
        case NST_TASK_EVENT_ACTION.TODO_REMOVED:
        case NST_TASK_EVENT_ACTION.TODO_CHANGED:
        case NST_TASK_EVENT_ACTION.TODO_DONE:
        case NST_TASK_EVENT_ACTION.TODO_UNDONE:
          return parseTask(data);
        case NST_TASK_EVENT_ACTION.STATUS_CHANGED:
          return parseStatus(data);
        case NST_TASK_EVENT_ACTION.LABEL_ADDED:
        case NST_TASK_EVENT_ACTION.LABEL_REMOVED:
          return parseLabel(data);
        case NST_TASK_EVENT_ACTION.DUE_DATE_UPDATED:
        case NST_TASK_EVENT_ACTION.DUE_DATE_REMOVED:
          return parseDueDate(data);

        default:
          NstSvcLogger.error('The provided activity type is not supported:' + data.action);
          return null;
      }
    }

    function parseWatcher(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseAttachment(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseComment(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseTask(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseCandidate(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseStatus(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseLabel(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function parseDueDate(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);

      return activity;
    }

    function getActivities(settings, cacheHandler) {
      return factory.sentinel.watch(function () {

        var deferred = $q.defer();

        NstSvcServer.request('task/get_activities', {
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
      }, 'getTaskActivities', settings.placeId);
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
  }
})();
