(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcTaskActivityFactory', NstSvcTaskActivityFactory);

  /** @ngInject */
  function NstSvcTaskActivityFactory($q, $rootScope, _, NST_TASK_EVENT_ACTION, NstSvcServer, NstSvcUserFactory,
                                     NstBaseFactory, NstTaskActivity, NstSvcLabelFactory, NstCollector,
                                     NstUtility, NstSvcAttachmentFactory, NST_SRV_PUSH_CMD) {


    function ActivityFactory() {
      this.collector = new NstCollector('task_activity', this.getManyActivity);
      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_TASK_ACTIVITY, function (event) {
        var data = event.detail;
        $rootScope.$broadcast(NST_TASK_EVENT_ACTION.TASK_ACTIVITY, {
          type: data.action,
          taskId: data.task_id
        });
      });
    }

    ActivityFactory.prototype = new NstBaseFactory();
    ActivityFactory.prototype.constructor = ActivityFactory;
    ActivityFactory.prototype.get = get;
    ActivityFactory.prototype.getAfter = getAfter;
    ActivityFactory.prototype.parseActivity = parseActivity;
    ActivityFactory.prototype.getActivity = getActivity;
    ActivityFactory.prototype.getManyActivity = getManyActivity;

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
        case NST_TASK_EVENT_ACTION.EDITOR_ADDED:
        case NST_TASK_EVENT_ACTION.EDITOR_REMOVED:
          return parseEditor(data);
        case NST_TASK_EVENT_ACTION.ATTACHMENT_ADDED:
        case NST_TASK_EVENT_ACTION.ATTACHMENT_REMOVED:
          return parseAttachment(data);
        case NST_TASK_EVENT_ACTION.COMMENT:
          return parseComment(data);
        case NST_TASK_EVENT_ACTION.TITLE_CHANGED:
        case NST_TASK_EVENT_ACTION.DESC_CHANGED:
        case NST_TASK_EVENT_ACTION.CREATED:
          return parseTask(data);
        case NST_TASK_EVENT_ACTION.STATUS_CHANGED:
          return parseTaskStatus(data);
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
          case NST_TASK_EVENT_ACTION.ASSIGNEE_CHANGED:
          return parseAssigneeChanged(data);

        default:
          return null;
      }
    }

    function parseDefault(activity, data) {
      activity.id = data._id;
      activity.type = data.action;
      activity.date = data.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(data.actor);
    }

    function parseWatcher(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.watchers = _.map(data.watchers, function (item) {
        return NstSvcUserFactory.parseTinyUser(item);
      });

      return activity;
    }

    function parseEditor(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.editors = _.map(data.editors, function (item) {
        return NstSvcUserFactory.parseTinyUser(item);
      });

      return activity;
    }

    function parseAttachment(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.attachments = _.map(data.attachments, NstSvcAttachmentFactory.parseAttachment);

      return activity;
    }

    function parseComment(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.comment = {
        id: data._id,
        body: data.comment_text,
        timestamp: data.timestamp,
        sender: activity.actor,
        removedById: null,
        attachmentId: ''
      };

      return activity;
    }

    function parseTask(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      if (data.title) {
        activity.task = {
          title: data.title
        };
      }

      return activity;
    }

    function parseTaskStatus(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.task = {
        status: data.status
      };

      return activity;
    }

    function parseCandidate(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.candidates = _.map(data.candidates, function (item) {
        return NstSvcUserFactory.parseTinyUser(item);
      });

      return activity;
    }

    function parseTodo(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.todo = {
        text: data.todo_text
      };

      return activity;
    }

    function parseLabel(data) {
      var activity = new NstTaskActivity();
      parseDefault(activity, data);
      activity.labels = data.labels;

      return activity;
    }

    function parseDueDate(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.dueDate = data.due_date;
      activity.hasDueTime = data.due_data_has_clock;

      return activity;
    }

    function parseAssigneeChanged(data) {
      var activity = new NstTaskActivity();

      parseDefault(activity, data);

      activity.assignee = NstSvcUserFactory.parseTinyUser(data.assignee);

      return activity;
    }

    function getActivities(settings/*, cacheHandler*/) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('task/get_activities', {
          task_id: settings.id,
          details: true,
          only_comments: settings.onlyComments,
          limit: settings.limit || 32,
          skip: settings.skip || 0,
          before: settings.before,
          after: settings.after
        }, function (/*cachedResponse*/) {
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
        skip: settings.skip,
        before: settings.date,
        onlyComments: settings.onlyComments
      }, cacheHandler);
    }

    function getAfter(settings) {
      return getActivities({
        id: settings.id,
        limit: settings.limit,
        after: settings.date,
        onlyComments: settings.onlyComments
      });
    }

    function getActivity(id) {
      var factory = this;
      var deferred = $q.defer();

      this.collector.add(id).then(function (data) {
        deferred.resolve(factory.parseActivity(data));
      }).catch(function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getManyActivity(ids) {
      var defer = $q.defer();
      var joinedIds = ids.join(',');
      if (!joinedIds) {
        defer.reject(null);
      } else {
        NstSvcServer.request('task/get_many_activities', {
          activity_id: joinedIds,
          details: true
        }).then(function (data) {

          var not_access = _.differenceWith(ids, data.tasks, function (i, b) {
            return i === b._id;
          });

          defer.resolve({
            idKey: '_id',
            resolves: data.tasks,
            rejects: not_access
          });
        }).catch(defer.reject);
      }

      return defer.promise;
    }
  }
})();
