(function () {
  'use strict';

  /**
   * @function NstSvcDate
   * @memberOf ronak.nested.web
   * @description This service manage timestamp and time differential between server and client.
   * This service get service time and serve correct time for other service and functions and
   * developer must get current time from this service (not Date.now()).
   */

  angular
    .module('ronak.nested.web')
    .service('NstSvcDate', NstSvcDate);

  function NstSvcDate() {

    /**
     * NstSvcDate service.
     * @constructor
     */
    function DateConstants() {
      this.serverTime = Date.now();
      this.timeDiff = 0;
    }

    DateConstants.prototype = new Object();
    DateConstants.prototype.constructor = DateConstants;

    /**
     * Set server timestamp reference
     *
     * @param timestamp
     */

    DateConstants.prototype.setServerTime = function (timestamp) {
      this.serverTime = timestamp;
      this.timeDiff = this.serverTime - Date.now();
    };

    /**
     * Calculate and get Now timestamp
     *
     * @returns {number} server timestamp
     */
    DateConstants.prototype.now = function (timestamp) {
      if (timestamp){
        return timestamp + this.timeDiff;
      }else {
        return Date.now() + this.timeDiff;
      }
    };

    return new DateConstants();
  }
})();
