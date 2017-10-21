(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcTaskFactory', NstSvcTaskFactory);

  /** @ngInject */
  function NstSvcTaskFactory($q, _,
                             NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache, NstSvcAttachmentFactory,
                             NstTask, NstSvcLabelFactory, NST_SRV_ERROR) {

    function TaskFactory() {
      this.collector = new NstCollector('task', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('task');
    }

    TaskFactory.prototype = new NstBaseFactory();
    TaskFactory.prototype.constructor = TaskFactory;
    TaskFactory.prototype.parseTask = parseTask;
    TaskFactory.prototype.create = create;
    TaskFactory.prototype.addAttachment = addAttachment;
    TaskFactory.prototype.removeAttachment = removeAttachment;
    TaskFactory.prototype.addComment = addComment;
    TaskFactory.prototype.removeComment = removeComment;
    TaskFactory.prototype.addLabel = addLabel;
    TaskFactory.prototype.removeLabel = removeLabel;
    TaskFactory.prototype.addTodo = addTodo;
    TaskFactory.prototype.removeTodo = removeTodo;
    TaskFactory.prototype.getByFilter = getByFilter;
    TaskFactory.prototype.get = get;
    TaskFactory.prototype.getMany = getMany;

    function parseTask(data) {
      if (!(data && data._id)) {
        return null;
      }

      var task = new NstTask();

      task.id = data._id;
      task.assignor = NstSvcUserFactory.parseTinyUser(data.assignor);
      if (data.task_assignee) {
        task.assignee = NstSvcUserFactory.parseTinyUser(data.task_assignee);
      }
      if (data.task_candidates) {
        task.candidates = _.map(data.task_candidates, function (item) {
          return NstSvcUserFactory.parseTinyUser(item);
        });
      }
      task.title = data.title;
      task.dueDate = data.dueDate;
      task.description = data.description;
      if (data.task_attachments) {
        task.attachments = _.map(data.task_attachments, NstSvcAttachmentFactory.parseAttachment);
      }
      if (data.task_watchers) {
        task.watchers = _.map(data.task_watchers, function (item) {
          return NstSvcUserFactory.parseTinyUser(item);
        });
      }
      if (data.task_labels) {
        task.labels = _.map(data.task_labels, function (item) {
          NstSvcLabelFactory.set(item);
          return NstSvcLabelFactory.parseLabel(item);
        });
      }
      task.counters = data.counters;

      return task;
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
        params.task_due = task.dueDate;
      }

      if (task.description) {
        params.desc = task.description;
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

      return this.sentinel.watch(function () {
        return NstSvcServer.request('task/create', params).then(function (response) {
        task.id = response.task_id;
          return $q.resolve({task: task});
        }).catch(function (reject) {
          return $q.reject(reject);
        });
      }, 'task-create-' + task.title);
    }

    function addAttachment(task_id, universal_id) {
      return NstSvcServer.request('task/add_attachment', {
        task_id: task_id,
        universal_id: universal_id
      });
    }

    function removeAttachment(task_id, universal_id) {
      return NstSvcServer.request('task/remove_attachment', {
        task_id: task_id,
        universal_id: universal_id
      });
    }

    function addComment(task_id, comment) {
      return NstSvcServer.request('task/add_comment', {
        task_id: task_id,
        txt: comment
      });
    }

    function removeComment(task_id, activity_id) {
      return NstSvcServer.request('task/remove_comment', {
        task_id: task_id,
        activity_id: activity_id
      });
    }

    function addLabel(task_id, label_id, label_name) {
      return NstSvcServer.request('task/add_label', {
        task_id: task_id,
        label_id: label_id,
        label_name: label_name
      });
    }

    function removeLabel(task_id, label_id) {
      return NstSvcServer.request('task/remove_label', {
        task_id: task_id,
        label_id: label_id
      });
    }

    function addTodo(task_id, title, weight) {
      return NstSvcServer.request('task/add_todo', {
        task_id: task_id,
        txt: title,
        weight: weight
      });
    }

    function removeTodo(task_id, todo_id) {
      return NstSvcServer.request('task/remove_todo', {
        task_id: task_id,
        todo_id: todo_id
      });
    }

    function getByFilter(filter, statusFilter, skip, limit) {
      var factory = this;
      var deferred = $q.defer();

      return this.sentinel.watch(function () {

        NstSvcServer.request('task/get_by_filter', {
          filter: filter,
          status_filter: statusFilter,
          skip: skip,
          limit: limit
        }).then(function (data) {
          deferred.resolve(_.map(data.tasks, function (task) {
            return factory.parseTask(task);
          }));
        }).catch(deferred.reject);

        return deferred.promise;
      }, 'task-get-by-filter' + filter + statusFilter);
    }

    function get(id) {
      var factory = this;
      var deferred = $q.defer();

      // var cachedLabel = this.getCachedSync(id);
      // if (cachedLabel) {
      //   deferred.resolve(cachedLabel);
      // }

      this.collector.add(id).then(function (data) {
        // factory.set(data);
        deferred.resolve(factory.parseTask(data));
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            // factory.cache.remove(id);
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

    return new TaskFactory();
  }
})();
