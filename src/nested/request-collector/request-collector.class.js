/**
 *
 * This is a class that use for collect and resolve actions on a certain period of time;
 *
 * For example in collect post_get request and call post_get_many function with array of post ids
 * and resolve/reject each post_get request;
 *
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstCollector', NstCollector);

  /** @ngInject */
  function NstCollector(_, $q) {

    /**
     * Interval time of each period
     *
     * @type {number}
     */
    var intervalTime = 200,

      /**
       * Maximum number of stack batch to call main function (fn)
       *
       * @type {number}
       */
      maximumCollectionLength = 20;


    /**
     * Collector Constructor
     *
     * define main values
     *
     * @param {string} name
     * @param {promise} fn main function called with array of Ids
     *
     * @constructor
     */
    function Collector(name, fn) {

      /**
       * A Stack of items that must collect
       * this object erase after each main function call
       * @type object
       */
      this.itemStack = {};

      /**
       * Main function
       */
      this.fn = fn;

      /**
       * Keep interval state
       *
       * @type {boolean}
       */
      this.intervalActive = false;
    }

    Collector.prototype.constructor = Collector;

    /**
     * Start interval and change that state
     *
     */
    Collector.prototype.startInterval = function () {
      this._interval = setInterval(this.apply.bind(this), intervalTime);
      this.intervalActive = true;
    };

    /**
     * Cancel interval and change that state
     *
     */
    Collector.prototype.stopInterval = function () {
      clearInterval(this._interval);
      this.intervalActive = false;
    };

    /**
     * Add items to current batch of items
     *
     * if interval state was false and it stopped, start that too.
     * also check if number of items in stack raised maximumCollectionLength apply main function
     *
     * @param  {string|integer} id
     * @returns {Function} promise
     */
    Collector.prototype.add = function (id) {

      if (!this.intervalActive) this.startInterval();

      var defer = $q.defer();
      if (this.itemStack[id]) {
        this.itemStack[id].push(defer);
      } else {
        this.itemStack[id] = [defer]
      }

      if (Object.keys(this.itemStack).length >= maximumCollectionLength) {
        this.apply();
      }

      return defer.promise;
    };


    /**
     * Apply main function
     *
     * make a copy of current stack and check it for stop interval or not
     * call main function with array of stack items id's and resolve/reject
     *
     */
    Collector.prototype.apply = function () {
      var batchItem = _.clone(this.itemStack);
      this.itemStack = {};
      if (Object.keys(batchItem).length > 0) {
        this.fn(Object.keys(batchItem))
          .then(function (response) {

            _.each(response.resolves, function (item) {
              _.each(batchItem[item[response.idKey]], function (promise) {
                promise.resolve(item);
              });
            });

            _.each(response.rejects, function (item) {
              _.each(batchItem[item[response.idKey]], function (promise) {
                promise.reject();
              });
            });

          }).catch(function (error) {
          _.each(Object.keys(batchItem), function (id) {
            _.each(batchItem[id], function (promise) {
              promise.reject(error);
            });
          });
        });

      } else {
        this.stopInterval();
      }
    };

    return Collector;
  }
})();
