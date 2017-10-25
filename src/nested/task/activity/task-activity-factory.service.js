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
        case NST_TASK_EVENT_ACTION.STATUS_CHANGED:
          return parseTask(data);
        case NST_TASK_EVENT_ACTION.CANDIDATE_ADDED:
        case NST_TASK_EVENT_ACTION.CANDIDATE_REMOVED:
          return parseCandidate(data);
        case NST_TASK_EVENT_ACTION.TODO_ADDED:
        case NST_TASK_EVENT_ACTION.TODO_REMOVED:
        case NST_TASK_EVENT_ACTION.TODO_CHANGED:
        case NST_TASK_EVENT_ACTION.TODO_DONE:
        case NST_TASK_EVENT_ACTION.TODO_UNDONE:
          return parseTodo(data);
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

    function parseDefault(activity, data) {

    }

    function parseWatcher(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.watchers = _.map(data.watchers, function (item) {
        return NstSvcUserFactory.parseTinyUser(item);
      });

      return activity;
    }

    function parseAttachment(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.attachments = _.map(data.attachments, NstSvcAttachmentFactory.parseAttachment);

      return activity;
    }

    function parseComment(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.comment = {
        id: data._id,
        body: data.comment_text,
        timestamp: data.timestamp,
        sender: activity.actor,
        removedById: null
      };

      return activity;
    }

    function parseTask(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      if (data.title) {
        activity.task = {
          title: data.title
        };
      }

      return activity;
    }

    function parseCandidate(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.candidates = _.map(data.candidates, function (item) {
        return NstSvcUserFactory.parseTinyUser(item);
      });

      return activity;
    }

    function parseTodo(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
      activity.todo = {
        text: data.todo_text
      };

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
      console.log('parseDueDate', data);
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
          task_id: settings.id,
          details: true,
          only_comments: settings.onlyComment,
          limit: settings.limit || 32,
          before: settings.before,
          after: settings.after
        }, function (cachedResponse) {
          // if (_.isFunction(cacheHandler) && cachedResponse) {
          //   cacheHandler(_.map(cachedResponse.activities, parseActivity));
          // }
        }).then(function (response) {

          deferred.resolve(_.map(response.activities, parseActivity));

        }).catch(deferred.reject);

        return deferred.promise;
      }, 'getTaskActivities', settings.id);
    }

    function get(settings, cacheHandler) {
      return getActivities({
        id: settings.id,
        limit: settings.limit,
        before: settings.date,
        onlyComment: settings.onlyComment
      }, cacheHandler);
    }

    function getAfter(settings) {
      return getActivities({
        id: settings.id,
        limit: settings.limit,
        after: settings.date,
        onlyComment: settings.onlyComment
      });
    }
  }
})();
