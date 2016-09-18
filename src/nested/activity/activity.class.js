(function() {
  'use strict';

  angular.module('ronak.nested.web.activity').factory('NstActivity', NstActivity);

  function NstActivity(NstModel) {
    /**
     * Activity - creates an instance of NstActivity
     *
     * @param  {Object}   model   a raw object
     */
    function Activity(model) {

      NstModel.call(this);

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

      this.fill(model);

      return this;
    }

    Activity.prototype = new NstModel();
    Activity.prototype.constructor = Activity;

    return Activity;

  }

})();
