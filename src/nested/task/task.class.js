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
      this.assignee = '';
      this.candidates = '';
      this.title = '';
      this.dueDate = undefined;
      this.description = '';
      this.todos = undefined;
      this.attachments = undefined;
      this.watchers = undefined;
      this.labels = undefined;
    }

    return Task;
  }
})();