(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .factory('NstTaskActivity', NstTaskActivity);

  function NstTaskActivity() {

    function TaskActivity() {

      this.id = null;
      this.type = null;
      this.actor = null;
      this.date = null;
      this.lastUpdate = null;

    }

    TaskActivity.prototype = {};
    TaskActivity.prototype.constructor = TaskActivity;

    return TaskActivity;

  }

})();
