(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .factory('NstTaskActivity', NstTaskActivity);

  function NstTaskActivity() {

    function Activity() {

      this.id = null;
      this.type = null;
      this.actor = null;
      this.date = null;
      this.lastUpdate = null;

    }

    Activity.prototype = {};
    Activity.prototype.constructor = Activity;

    return Activity;

  }

})();
