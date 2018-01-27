(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcTaskFactory', NstSvcTaskFactory);

  /** @ngInject */
  function NstSvcTaskFactory($q, _,
                             NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache, NstSvcAttachmentFactory,
                             NstTask, NstSvcLabelFactory, NST_SRV_ERROR, NST_TASK_ACCESS) {

    function TaskFactory() {
      this.collector = new NstCollector('task', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('task');
    }

    TaskFactory.prototype = new NstBaseFactory();
    TaskFactory.prototype.constructor = TaskFactory;
    TaskFactory.prototype.parseTask = parseTask;
    TaskFactory.prototype.parseTaskTodo = parseTaskTodo;
    TaskFactory.prototype.parseTaskAccess = parseTaskAccess;
    TaskFactory.prototype.create = create;
    TaskFactory.prototype.addAttachment = addAttachment;
    TaskFactory.prototype.removeAttachment = removeAttachment;
    TaskFactory.prototype.addCandidate = addCandidate;
    TaskFactory.prototype.removeCandidate = removeCandidate;
    TaskFactory.prototype.updateAssignee = updateAssignee;
    TaskFactory.prototype.addComment = addComment;
    TaskFactory.prototype.removeComment = removeComment;
    TaskFactory.prototype.addLabel = addLabel;
    TaskFactory.prototype.removeLabel = removeLabel;
    TaskFactory.prototype.addTodo = addTodo;
    TaskFactory.prototype.removeTodo = removeTodo;
    TaskFactory.prototype.updateTodo = updateTodo;
    TaskFactory.prototype.addWatcher = addWatcher;
    TaskFactory.prototype.removeWatcher = removeWatcher;
    TaskFactory.prototype.taskUpdate = taskUpdate;
    TaskFactory.prototype.respond = respond;
    TaskFactory.prototype.setStatus = setStatus;
    TaskFactory.prototype.setState = setState;
    TaskFactory.prototype.remove = remove;
    TaskFactory.prototype.getByFilter = getByFilter;
    TaskFactory.prototype.getByCustomFilter = getByCustomFilter;
    TaskFactory.prototype.handleCachedResponse = handleCachedResponse;
    TaskFactory.prototype.parseCachedModel = parseCachedModel;
    TaskFactory.prototype.transformToCacheModel = transformToCacheModel;
    TaskFactory.prototype.getCachedSync = getCachedSync;
    TaskFactory.prototype.set = set;
    TaskFactory.prototype.get = get;
    TaskFactory.prototype.getMany = getMany;
    TaskFactory.prototype.search = search;

    function parseTask(data) {
      var factory = this;
      if (!(data && data._id)) {
        return null;
      }

      var task = new NstTask();

      task.id = data._id;
      task.status = data.status;
      if (task.assignor) {
        task.assignor = NstSvcUserFactory.parseTinyUser(data.assignor);
      }
      if (data.assignee) {
        task.assignee = NstSvcUserFactory.parseTinyUser(data.assignee);
      }
      if (data.candidates) {
        task.candidates = _.map(data.candidates, function (item) {
          return NstSvcUserFactory.parseTinyUser(item);
        });
      }
      task.title = data.title;
      if (data.due_date) {
        task.dueDate = data.due_date;
        task.hasDueTime = data.due_data_has_clock;
      }
      task.description = data.description;


      if (data.todos) {
        task.todos = _.map(data.todos, function (item) {
          return factory.parseTaskTodo(item);
        });

        var total = task.todos.length;
        var done = 0;
        _.forEach(task.todos, function (item) {
          if (item.checked) {
            done++;
          }
        });

        if (total > 0) {
          task.progress = Math.ceil((done/total) * 100);
        }
      }

      if (data.attachments) {
        task.attachments = _.map(data.attachments, NstSvcAttachmentFactory.parseAttachment);
      }
      if (data.watchers) {
        task.watchers = _.map(data.watchers, function (item) {
          return NstSvcUserFactory.parseTinyUser(item);
        });
      }
      if (data.labels) {
        task.labels = _.map(data.labels, function (item) {
          NstSvcLabelFactory.set(item);
          return NstSvcLabelFactory.parseLabel(item);
        });
      }
      if (data.related_to) {
        task.relatedTask = {
          id: data.related_to._id,
          title: data.related_to.title
        };
      }
      if (data.related_tasks) {
        task.childTasks = _.map(data.related_tasks, function (item) {
          return {
            id: item._id,
            title: item.title
          };
        });
      }
      task.counters = data.counters;

      task.access = factory.parseTaskAccess(data.access);

      return task;
    }

    function parseTaskTodo(data) {
      if (!(data && data._id)) {
        return null;
      }

      var todo = {
        id: undefined,
        text: undefined,
        checked: undefined,
        weight: undefined
      };

      todo.id = data._id;
      todo.text = data.txt;
      todo.checked = data.done;
      todo.weight = data.weight;
      todo.focusTrigger = 0;

      return todo;
    }


    var taskAccessMap = {};
    taskAccessMap[NST_TASK_ACCESS.PICK_TASK] = ['pickTask'];
    taskAccessMap[NST_TASK_ACCESS.READ_TASK] = ['readTask'];
    taskAccessMap[NST_TASK_ACCESS.PICK_TASK] = ['pickTask'];
    taskAccessMap[NST_TASK_ACCESS.UPDATE_TASK] = ['updateTask', 'addTodo', 'removeTodo'];
    taskAccessMap[NST_TASK_ACCESS.DELETE_TASK] = ['deleteTask'];
    taskAccessMap[NST_TASK_ACCESS.ADD_CANDIDATE] = ['addCandidate', 'removeCandidate'];
    taskAccessMap[NST_TASK_ACCESS.CHANGE_ASSIGNEE] = ['changeAssignee'];
    taskAccessMap[NST_TASK_ACCESS.CHANGE_PRIORITY] = ['changePriority'];
    taskAccessMap[NST_TASK_ACCESS.LABEL] = ['label'];
    taskAccessMap[NST_TASK_ACCESS.ADD_LABEL] = ['addLabel'];
    taskAccessMap[NST_TASK_ACCESS.REMOVE_LABEL] = ['removeLabel'];
    taskAccessMap[NST_TASK_ACCESS.COMMENT] = ['addComment', 'removeComment'];
    taskAccessMap[NST_TASK_ACCESS.ADD_ATTACHMENT] = ['addAttachment'];
    taskAccessMap[NST_TASK_ACCESS.REMOVE_ATTACHMENT] = ['removeAttachment'];
    taskAccessMap[NST_TASK_ACCESS.ADD_WATCHER] = ['addWatcher'];
    taskAccessMap[NST_TASK_ACCESS.REMOVE_WATCHER] = ['removeWatcher'];

    function parseTaskAccess(data) {
      var access = {
        pickTask: false,
        readTask: false,
        updateTask: false,
        deleteTask: false,
        addCandidate: false,
        removeCandidate: false,
        changeAssignee: false,
        changePriority: false,
        label: false,
        addLabel: false,
        removeLabel: false,
        addComment: false,
        removeComment: false,
        addAttachment: false,
        removeAttachment: false,
        addWatcher: false,
        removeWatcher: false,
        addTodo: false,
        removeTodo: false
      };

      _.forEach(data, function (item) {
        _.forEach(taskAccessMap[item], function (key) {
          access[key] = true;
        });
      });

      return access;
    }

    function getCommaSeparate(data) {
      return _.map(data, function (item) {
        return item.id;
      }).join(',');
    }

    function create(task) {
      var params = {
        title: task.title
      };

      if (task.assignee) {
        params.assignee_id = task.assignee.id
      }

      if (task.candidates) {
        params.candidate_id = getCommaSeparate(task.candidates);
      }

      if (task.dueDate) {
        params.due_date = task.dueDate;
        params.due_date_has_clock = task.hasDueTime;
      }

      if (task.description) {
        params.desc = task.description;
      }

      if (task.todos) {
        params.todos = task.todos;
      }

      if (task.attachments) {
        params.attachment_id = getCommaSeparate(task.attachments);
      }

      if (task.watchers) {
        params.watcher_id = getCommaSeparate(task.watchers);
      }

      if (task.labels) {
        params.label_id = getCommaSeparate(task.labels);
      }

      if (task.relatedTask) {
        params.related_to = task.relatedTask;
        params.due_data_has_clock = task.hasDueTime;
      }

      if (task.relatedPost) {
        params.related_post = task.relatedPost;
      }

      return this.sentinel.watch(function () {
        return NstSvcServer.request('task/create', params).then(function (response) {
        task.id = response.task_id;
          return $q.resolve({task: task});
        }).catch(function (reject) {
          return $q.reject(reject);
        });
      }, 'task-create-' + task.title);
    }

    function addAttachment(taskId, universalId) {
      return NstSvcServer.request('task/add_attachment', {
        task_id: taskId,
        universal_id: universalId
      });
    }

    function removeAttachment(taskId, universalId) {
      return NstSvcServer.request('task/remove_attachment', {
        task_id: taskId,
        universal_id: universalId
      });
    }

    function addCandidate(taskId, candidateId) {
      return NstSvcServer.request('task/add_candidate', {
        task_id: taskId,
        candidate_id: candidateId
      });
    }

    function removeCandidate(taskId, candidateId) {
      return NstSvcServer.request('task/remove_candidate', {
        task_id: taskId,
        candidate_id: candidateId
      });
    }

    function updateAssignee(taskId, accountId) {
      return NstSvcServer.request('task/update_assignee', {
        task_id: taskId,
        account_id: accountId
      });
    }

    function addComment(taskId, comment) {
      return NstSvcServer.request('task/add_comment', {
        task_id: taskId,
        txt: comment
      });
    }

    function removeComment(taskId, activityId) {
      return NstSvcServer.request('task/remove_comment', {
        task_id: taskId,
        activity_id: activityId
      });
    }

    function addLabel(taskId, labelId, labelName) {
      return NstSvcServer.request('task/add_label', {
        task_id: taskId,
        label_id: labelId,
        label_name: labelName
      });
    }

    function removeLabel(taskId, labelId) {
      return NstSvcServer.request('task/remove_label', {
        task_id: taskId,
        label_id: labelId
      });
    }

    function addTodo(taskId, text, weight) {
      return NstSvcServer.request('task/add_todo', {
        task_id: taskId,
        txt: text,
        weight: weight
      });
    }

    function removeTodo(taskId, todoId) {
      return NstSvcServer.request('task/remove_todo', {
        task_id: taskId,
        todo_id: todoId
      });
    }

    function updateTodo(taskId, todoId, checked, text, weight) {
      return NstSvcServer.request('task/update_todo', {
        task_id: taskId,
        todo_id: todoId,
        txt: text,
        weight: weight,
        done: checked
      });
    }

    function addWatcher(taskId, watcherId) {
      return NstSvcServer.request('task/add_watcher', {
        task_id: taskId,
        watcher_id: watcherId
      });
    }

    function removeWatcher(taskId, watcherId) {
      return NstSvcServer.request('task/remove_watcher', {
        task_id: taskId,
        watcher_id: watcherId
      });
    }

    function taskUpdate(taskId, title, desc, dueDate, hasDueTime) {
      return NstSvcServer.request('task/update', {
        task_id: taskId,
        title: title,
        desc: desc,
        due_date: dueDate,
        due_date_has_clock: hasDueTime
      });
    }

    function respond(taskId, response, reason) {
      return NstSvcServer.request('task/respond', {
        task_id: taskId,
        response: response,
        reason: reason
      });
    }

    function setStatus(taskId, status) {
      return NstSvcServer.request('task/set_status', {
        task_id: taskId,
        status: status
      });
    }

    /**
     * Task set state
     *
     * @param  {int}      taskId
     * @param  {string}   state [STATE_COMPLETED, STATE_HOLD, STATE_IN_PROGRESS]
     *
     * @returns {Promise}
     */
    function setState(taskId, state) {
      return NstSvcServer.request('task/set_state', {
        task_id: taskId,
        state: state
      });
    }

    function remove(taskId) {
      return NstSvcServer.request('task/remove', {
        task_id: taskId
      });
    }

    function getByFilter(options, cacheHandler) {
      var factory = this;
      var deferred = $q.defer();

      if (options.statusFilter) {
        options.status_filter = String(options.statusFilter);
      }

      return this.sentinel.watch(function () {
        NstSvcServer.request('task/get_by_filter', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
          deferred.resolve(_.map(data.tasks, function (task) {
            factory.set(task);
            return factory.parseTask(task);
          }));
        }).catch(deferred.reject);

        return deferred.promise;
      }, 'task-get-by-filter' + options.filter + options.statusFilter);
    }

    function getByCustomFilter(options, cacheHandler) {
      var factory = this;
      var deferred = $q.defer();

      if (options.statusFilter) {
        options.status_filter = String(options.statusFilter);
      }

      return this.sentinel.watch(function () {
        NstSvcServer.request('task/get_by_custom_filter', options, _.partial(handleCachedResponse, cacheHandler)).then(function (data) {
          deferred.resolve(_.map(data.tasks, function (task) {
            factory.set(task);
            return factory.parseTask(task);
          }));
        }).catch(deferred.reject);

        return deferred.promise;
      }, 'task-get-by-custom-filter');
    }

    function handleCachedResponse(cacheHandler, cachedResponse) {
      if (cachedResponse && _.isFunction(cacheHandler)) {
        var cachedPosts = _.map(cachedResponse.tasks, function (task) {
          return factory.getCachedSync(task._id);
        });
        cacheHandler(_.compact(cachedPosts));
      }
    }

    function parseCachedModel(data) {
      var factory = this;
      if (!data) {
        return null;
      }

      var task = new NstTask();

      task.id = data._id;
      task.status = data.status;
      if (data.assignor) {
        task.assignor = NstSvcUserFactory.getCachedSync(data.assignor);
      }
      if (data.assignee) {
        task.assignee = NstSvcUserFactory.getCachedSync(data.assignee);
      }
      if (data.candidates) {
        task.candidates = _.map(data.candidates, function (item) {
          return NstSvcUserFactory.getCachedSync(item);
        });
      }
      task.title = data.title;
      if (data.due_date) {
        task.dueDate = data.due_date;
        task.hasDueTime = data.due_data_has_clock;
      }
      task.description = data.description;

      if (data.todos) {
        task.todos = _.map(data.todos, function (item) {
          return factory.parseTaskTodo(item);
        });

        var total = task.todos.length;
        var done = 0;
        _.forEach(task.todos, function (item) {
          if (item.checked) {
            done++;
          }
        });

        if (total > 0) {
          task.progress = Math.ceil((done/total) * 100);
        }
      }

      if (data.attachments) {
        task.attachments = _.map(data.attachments, NstSvcAttachmentFactory.parseAttachment);
      }
      if (data.watchers) {
        task.watchers = _.map(data.watchers, function (item) {
          return NstSvcUserFactory.getCachedSync(item);
        });
      }
      if (data.labels) {
        task.labels = _.map(data.labels, function (item) {
          return NstSvcLabelFactory.getCachedSync(item);
        });
      }
      if (data.related_to) {
        task.relatedTask = {
          id: data.related_to._id,
          title: data.related_to.title
        };
      }
      if (data.related_tasks) {
        task.childTasks = _.map(data.related_tasks, function (item) {
          return {
            id: item._id,
            title: item.title
          };
        });
      }
      task.counters = data.counters;

      task.access = factory.parseTaskAccess(data.access);

      return task;
    }

    function getCachedSync(id) {
      return this.parseCachedModel(this.cache.get(id));
    }

    function transformToCacheModel(data) {
      var copy = _.clone(data);
      copy.assignor = data.assignor ? data.assignor._id : null;
      copy.assignee = data.assignee ? data.assignee._id : null;
      copy.candidates = data.candidates ? _.map(data.candidates, '_id') : null;
      copy.watchers = data.watchers ? _.map(data.watchers, '_id') : null;
      copy.labels = _.map(data.labels, '_id');

      return copy;
    }

    function set(data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      }
    }

    function get(id, cachedResponse) {
      var factory = this;
      var deferred = $q.defer();

      if (_.isFunction(cachedResponse)) {
        var cachedTask = this.getCachedSync(id);
        if (cachedTask) {
          cachedResponse(cachedTask);
        }
      }

      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(factory.parseTask(data));
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            factory.cache.remove(id);
            break;
        }
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getMany(ids) {
      var defer = $q.defer();
      var joinedIds = ids.join(',');
      if (!joinedIds) {
        defer.reject(null);
      } else {
        NstSvcServer.request('task/get_many', {
          task_id: joinedIds
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

    function search(params, limit, skip) {
      var factory = this;
      var parameters = {
        assigner_id: params.assignors,
        assignee_id: params.assignees,
        label_title: params.labels,
        keyword: params.keywords,
        has_attachment: params.hasAttachment,
        limit: limit || 8,
        skip: skip || 0
      };
      var defer = $q.defer();
      return factory.sentinel.watch(function () {
        NstSvcServer.request('search/tasks', parameters).then(function (result) {
          defer.resolve(_.map(result.tasks, function(task) {
            return factory.parseTask(task);
          }));
        }).catch(defer.reject);
        return defer.promise;
      }, 'searchTask');
    }

    var factory = new TaskFactory();
    return factory;
  }
})();
