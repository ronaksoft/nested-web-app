(function() {
  'use strict';

  angular.module('ronak.nested.web.activity').factory('NstActivity', NstActivity);

  function NstActivity() {

    function Activity() {

      this.id = null;
      this.type = null;
      this.actor = null;
      this.date = null;
      this.lastUpdate = null;

      this.post = null;
      this.place = null;
      this.comment = null;

      this.member = null;
      this.memberType = null;

      return this;
    }

    Activity.prototype = {};
    Activity.prototype.constructor = Activity;

    return Activity;

  }

})();
