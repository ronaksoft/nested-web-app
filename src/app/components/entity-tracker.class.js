(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .factory('NstEntityTracker', NstEntityTracker);

  /** @ngInject */
  function NstEntityTracker(_) {
    function EntityTracker(limit) {
      this.eventKeys = [];
      this.limit = limit || 16;
    }

    EntityTracker.prototype = {};
    EntityTracker.prototype.constructor = EntityTracker;

    EntityTracker.prototype.track = function (key) {
      this.eventKeys.unshift(key);
      if (_.size(this.eventKeys) > this.limit) {
        this.eventKeys.length = this.limit;
      }
    };

    EntityTracker.prototype.isTracked = function (key) {
      return _.includes(this.eventKeys, key);
    };

    EntityTracker.prototype.flush = function () {
      this.eventKeys.length = 0;
    };

    return EntityTracker;
  }
})();
