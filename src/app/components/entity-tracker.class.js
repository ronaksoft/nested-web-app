/**
 * @file src/app/components/entity-tracker.class.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A tiny utility to keep a limited list of Ids
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .factory('NstEntityTracker', NstEntityTracker);

  /** @ngInject */
  /**
   * We designed NstEntityTracker service to track an activity an apply the required updates only once.
   * Let me give you an example. Imagin that someone has been removed from a place and we have to update
   * the number of memebers. We recieve a sync-a message and update the value.
   * But if you remove someone by clicking the remove button, The number of memebers should be updated
   * after the operation. Then we have to ignore any sync message regarding to that. We keep the Id of
   * the removed member and ignore all member-remove activity message if the removed memeber Id matches
   * an item in the list.
   * 
   * @param {any} _ 
   * @returns 
   */
  function NstEntityTracker(_) {
    function EntityTracker(limit) {
      this.eventKeys = [];
      this.limit = limit || 16;
    }

    EntityTracker.prototype = {};
    EntityTracker.prototype.constructor = EntityTracker;
    
    /**
     * Adds the given key to the list of tracked keys
     * 
     * @param {any} key 
     */
    EntityTracker.prototype.track = function (key) {
      this.eventKeys.unshift(key);
      if (_.size(this.eventKeys) > this.limit) {
        this.eventKeys.length = this.limit;
      }
    };

    /**
     * Returns true if the given key has already been registered
     * 
     * @param {any} key 
     * @returns 
     */
    EntityTracker.prototype.isTracked = function (key) {
      return _.includes(this.eventKeys, key);
    };

    /**
     * Clears the list of tracked keys
     * 
     */
    EntityTracker.prototype.flush = function () {
      this.eventKeys.length = 0;
    };

    return EntityTracker;
  }
})();
