(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTask', NstTask);

  function NstTask() {
    Task.prototype = {};
    Task.prototype.constructor = Task;

    function Task() {
      this.id = undefined;
      this.status = undefined;
      this.assignor = undefined;
      this.assignee = undefined;
      this.candidates = undefined;
      this.title = undefined;
      this.dueDate = undefined;
      this.hasDueTime = false;
      this.description = '';
      this.todos = undefined;
      this.attachments = undefined;
      this.watchers = undefined;
      this.labels = undefined;
      this.counters = undefined;
      this.access = undefined;
      this.progress = -1;
      this.relatedTask = undefined;
      this.childTasks = undefined;
      this.relatedPost = undefined;
      this.completedOn = undefined;
    }

    return Task;
  }
})();
